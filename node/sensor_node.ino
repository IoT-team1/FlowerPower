#include <ArduinoJson.h>

#define M_SENSOR A0
#define DHT_PIN 4

const int DryVal = 3366;
const int WetVal = 1320;

int moistureVal;
int moisturePercent;

byte dhtData[5];

bool readDHT11() {
  for (int i = 0; i < 5; i++) dhtData[i] = 0;

  pinMode(DHT_PIN, OUTPUT);
  digitalWrite(DHT_PIN, LOW);
  delay(20);

  digitalWrite(DHT_PIN, HIGH);
  delayMicroseconds(40);

  pinMode(DHT_PIN, INPUT_PULLUP);

  unsigned long timeout;

  timeout = micros();
  while (digitalRead(DHT_PIN) == HIGH) {
    if (micros() - timeout > 100) return false;
  }

  timeout = micros();
  while (digitalRead(DHT_PIN) == LOW) {
    if (micros() - timeout > 100) return false;
  }

  timeout = micros();
  while (digitalRead(DHT_PIN) == HIGH) {
    if (micros() - timeout > 100) return false;
  }

  for (int i = 0; i < 40; i++) {
    timeout = micros();
    while (digitalRead(DHT_PIN) == LOW) {
      if (micros() - timeout > 100) return false;
    }

    unsigned long startTime = micros();

    timeout = micros();
    while (digitalRead(DHT_PIN) == HIGH) {
      if (micros() - timeout > 100) return false;
    }

    unsigned long duration = micros() - startTime;

    dhtData[i / 8] <<= 1;

    if (duration > 40) {
      dhtData[i / 8] |= 1;
    }
  }

  byte checksum = dhtData[0] + dhtData[1] + dhtData[2] + dhtData[3];

  return checksum == dhtData[4];
}

void setup() {
  Serial.begin(9600);
}

void loop() {
  moistureVal = analogRead(M_SENSOR);

  moisturePercent = map(moistureVal, DryVal, WetVal, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  bool dhtOk = readDHT11();

  StaticJsonDocument<192> measurements;

  measurements["MoisturePercent"] = moisturePercent;
  measurements["RawMoisture"] = moistureVal;

  if (dhtOk) {
    measurements["Temperature"] = dhtData[2];
    measurements["Humidity"] = dhtData[0];
  } else {
    measurements["Temperature"] = nullptr;
    measurements["Humidity"] = nullptr;
    measurements["DHTError"] = true;
  }

  serializeJson(measurements, Serial);
  Serial.println();

  delay(10000);
}