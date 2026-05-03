import json
import time
from datetime import datetime, timezone

import requests
import serial
from serial import SerialException


CONFIG_PATH = "config.json"


def load_config():
    with open(CONFIG_PATH, "r") as file:
        return json.load(file)


def login(config):
    url = f"{config['backendUrl']}/gateways/login"
    gw_id = config["gatewayId"]
    device_secret = config["deviceSecret"]
    payload = {
        "id":gw_id,
        "device_secret":device_secret
    }
    headers = {"Content-Type": "application/json"}

    response = requests.post(url, json=payload, headers=headers, timeout=50)
    print("Login status:", response.status_code)

    response.raise_for_status()
    return response.json()["accessToken"]


def read_node(config):
    port = config.get("arduinoPort", "/dev/ttyACM0")
    baud_rate = config.get("baudRate", 9600)

    try:
        print(f"Trying Arduino connection on {port} at {baud_rate} baud...")

        with serial.Serial(port, baud_rate, timeout=20) as arduino:
            print("Arduino serial connection established.")
            while True:
                line = arduino.readline().decode("utf-8", errors="replace").strip()

                if not line:
                    print("Arduino connection exists, but no data was received.")
                    return None

                print("Raw Arduino data:", line)

                try:
                    data = json.loads(line)
                except json.JSONDecodeError:
                    print("Arduino data is not valid JSON. Waiting for next line...")
                    continue

                moisture = data.get("MoisturePercent")
                raw_moisture = data.get("RawMoisture")

                if moisture is None:
                    print("Arduino JSON must contain 'MoisturePercent' field. Waiting for next line...")
                    continue

                measurement = {
                    "MoisturePercent": float(moisture),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }

                if raw_moisture is not None:
                    measurement["RawMoisture"] = float(raw_moisture)

                return measurement

    except SerialException as error:
        print("Arduino connection was not established.")
        print("Serial error:", error)
        return None

    except Exception as error:
        print("Unexpected Arduino read error:", error)
        return None


def send_measurement(config, token, measurement):
    url = f"{config['backendUrl']}/measurements"

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    response = requests.post(
        url,
        json=measurement,
        headers=headers,
        timeout=30
    )

    print("Measurement status:", response.status_code)
    print("Measurement response:", response.text)

    response.raise_for_status()


def main():
    config = load_config()

    print("Starting FlowerPower gateway...")

    token = login(config)

    measurement = read_node(config)

    if measurement is None:
        print("No valid Arduino measurement available. Nothing was sent to backend.")
        return

    print("Sending measurement:", measurement)
    send_measurement(config, token, measurement)

    print("Gateway run finished successfully.")

if __name__ == "__main__":
    main()