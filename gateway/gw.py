import json
import time
import sqlite3
from datetime import datetime, timezone
import requests
import serial
from serial import SerialException

CONFIG_PATH = "config.json"
DB_PATH = "flowerpower_local.db"


def utc_now_iso():
    return datetime.now(timezone.utc).isoformat()


def load_config():
    with open(CONFIG_PATH, "r") as file:
        return json.load(file)


def login(config):
    url = f"{config['backendUrl']}/gateways/login"
    payload = {
        "id": config["gatewayId"],
        "device_secret": config["deviceSecret"],
    }
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json=payload, headers=headers, timeout=50)
    print("Login status:", response.status_code)
    response.raise_for_status()

    data = response.json()

    return {
        "accessToken": data["accessToken"],
        "expiresIn": data.get("expiresIn", 3600),
    }


class TokenCache:
    """
    Stores the backend access token only in memory.
    If the gateway service restarts, the token disappears and a new one
    is fetched when the next backend send is needed.
    """

    def __init__(self):
        self.access_token = None
        self.expires_at = 0

    def clear(self):
        self.access_token = None
        self.expires_at = 0

    def get_valid_token(self, config):
        now = time.time()

        # Reuse token if it exists and is not close to expiry.
        # Refresh 60 seconds before expiry.
        if self.access_token and now < self.expires_at - 60:
            return self.access_token

        print("No valid token cached, logging in …")

        login_result = login(config)

        self.access_token = login_result["accessToken"]
        self.expires_at = time.time() + login_result.get("expiresIn", 3600)

        return self.access_token


def send_measurement(config, token, measurement):
    url = f"{config['backendUrl']}/measurements"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    response = requests.post(url, json=measurement, headers=headers, timeout=30)
    print("Backend response:", response.status_code, response.text)
    response.raise_for_status()


def init_db():
    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS measurements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            moisture REAL NOT NULL,
            temperature REAL NOT NULL,
            humidity REAL NOT NULL,
            timestamp TEXT NOT NULL,
            created_at TEXT NOT NULL,
            averaged INTEGER NOT NULL DEFAULT 0
        )
    """)

    connection.commit()
    connection.close()
    print("Local SQLite database is ready.")


def save_raw_measurement(measurement):
    """Persist a single raw reading from the Arduino."""
    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO measurements (
            moisture,
            temperature,
            humidity,
            timestamp,
            created_at,
            averaged
        )
        VALUES (?, ?, ?, ?, ?, 0)
    """, (
        measurement["moisture"],
        measurement.get("temperature"),
        measurement.get("humidity"),
        measurement["timestamp"],
        utc_now_iso(),
    ))

    connection.commit()
    connection.close()
    print("Raw measurement saved:", measurement)


def get_raw_measurements():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, moisture, temperature, humidity, timestamp
        FROM measurements
        WHERE averaged = 0
        ORDER BY timestamp ASC
    """)

    rows = cursor.fetchall()
    connection.close()
    return rows


def average_values(values):
    valid_values = [value for value in values if value is not None]

    if not valid_values:
        return None

    return round(sum(valid_values) / len(valid_values), 2)


def create_averaged_record(raw_rows):
    if not raw_rows:
        return

    raw_ids = [row["id"] for row in raw_rows]

    avg_moisture = average_values([row["moisture"] for row in raw_rows])
    avg_temperature = average_values([row["temperature"] for row in raw_rows])
    avg_humidity = average_values([row["humidity"] for row in raw_rows])

    avg_timestamp = raw_rows[-1]["timestamp"]

    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()

    try:
        cursor.execute("""
            INSERT INTO measurements (
                moisture,
                temperature,
                humidity,
                timestamp,
                created_at,
                averaged
            )
            VALUES (?, ?, ?, ?, ?, 1)
        """, (
            avg_moisture,
            avg_temperature,
            avg_humidity,
            avg_timestamp,
            utc_now_iso(),
        ))

        placeholders = ",".join("?" for _ in raw_ids)
        cursor.execute(
            f"DELETE FROM measurements WHERE id IN ({placeholders})", raw_ids
        )

        connection.commit()
        print(
            f"Averaged {len(raw_ids)} raw readings -> "
            f"moisture={avg_moisture}, "
            f"temperature={avg_temperature}, "
            f"humidity={avg_humidity}, "
            f"timestamp={avg_timestamp}"
        )

    except Exception as error:
        connection.rollback()
        print("Failed to create averaged record:", error)

    finally:
        connection.close()


def get_unsent_averaged_measurements():
    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row
    cursor = connection.cursor()

    cursor.execute("""
        SELECT id, moisture, temperature, humidity, timestamp
        FROM measurements
        WHERE averaged = 1
        ORDER BY timestamp ASC
    """)

    rows = cursor.fetchall()
    connection.close()
    return rows


def delete_measurements_by_ids(measurement_ids):
    if not measurement_ids:
        return

    connection = sqlite3.connect(DB_PATH)
    cursor = connection.cursor()

    placeholders = ",".join("?" for _ in measurement_ids)
    cursor.execute(
        f"DELETE FROM measurements WHERE id IN ({placeholders})",
        measurement_ids,
    )

    connection.commit()
    connection.close()
    print(f"Deleted {len(measurement_ids)} measurement(s) from local DB.")



def read_node(config):
    port = config.get("arduinoPort", "/dev/ttyACM0")
    baud_rate = config.get("baudRate", 9600)

    try:
        print(f"Reading Arduino on {port} @ {baud_rate} baud …")

        with serial.Serial(port, baud_rate, timeout=20) as arduino:
            while True:
                line = arduino.readline().decode("utf-8", errors="replace").strip()

                if not line:
                    print("No data received from Arduino.")
                    return None

                print("Raw Arduino data:", line)

                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    print("Not valid JSON, retrying …")
                    continue

                moisture = data.get("MoisturePercent")
                temperature = data.get("Temperature")
                humidity = data.get("Humidity")

                if moisture is None:
                    print("Missing 'MoisturePercent', retrying …")
                    continue

                return {
                    "moisture": float(moisture),
                    "temperature": float(temperature) if temperature is not None else None,
                    "humidity": float(humidity) if humidity is not None else None,
                    "timestamp": utc_now_iso(),
                }

    except SerialException as error:
        print("Serial error:", error)
        return None
    except Exception as error:
        print("Unexpected read error:", error)
        return None


def send_one_measurement_with_auth_retry(config, token_cache, payload):
    """
    Sends one payload to the backend.

    Flow:
    1. Get cached token or login if needed.
    2. Try to send.
    3. If backend returns 401, clear token, login again, and retry once.
    4. If retry also fails, raise the error so the caller keeps data in SQLite.
    """

    try:
        token = token_cache.get_valid_token(config)
        send_measurement(config, token, payload)
        return

    except requests.exceptions.HTTPError as error:
        status = error.response.status_code if error.response is not None else None

        if status != 401:
            raise

        print("Backend returned 401. Token may be expired or invalid.")
        print("Fetching a new token and retrying once …")

        token_cache.clear()

        new_token = token_cache.get_valid_token(config)
        send_measurement(config, new_token, payload)

        print("Measurement sent successfully after token refresh.")


def send_unsent_averaged(config, token_cache):
    rows = get_unsent_averaged_measurements()

    if not rows:
        print("No unsent averaged measurements.")
        return

    for row in rows:
        payload = {
            "plantId": "6a008831d209f12fc4fdb34a",
            "moisture": row["moisture"],
            "temperature": row["temperature"],
            "humidity": row["humidity"],
            "timestamp": row["timestamp"],
        }

        try:
            send_one_measurement_with_auth_retry(config, token_cache, payload)
            delete_measurements_by_ids([row["id"]])

        except requests.exceptions.HTTPError as error:
            status = error.response.status_code if error.response is not None else None

            print(
                f"Backend rejected measurement after retry if applicable "
                f"(HTTP {status}). Keeping measurement in queue."
            )
            break

        except requests.exceptions.RequestException as error:
            print("Network error. Keeping measurement in queue:", error)
            break

        except Exception as error:
            print("Unexpected send error. Keeping measurement in queue:", error)
            break


def main():
    config = load_config()

    measurement_interval = config.get("measurementIntervalSec", 10)
    averaging_interval = config.get("averagingIntervalSec", 120)

    init_db()

    token_cache = TokenCache()

    last_average_time = time.time()

    while True:
        measurement = read_node(config)

        if measurement is None:
            print("No valid reading — skipping this cycle.")
        else:
            save_raw_measurement(measurement)

        now = time.time()
        if now - last_average_time >= averaging_interval:
            raw_rows = get_raw_measurements()
            if raw_rows:
                create_averaged_record(raw_rows)

            send_unsent_averaged(config, token_cache)

            last_average_time = now

        print(f"Sleeping {measurement_interval}s until next reading …")
        time.sleep(measurement_interval)


if __name__ == "__main__":
    main()