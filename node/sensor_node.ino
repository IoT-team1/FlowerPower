#include <ArduinoJson.h>
#define SENSOR_IN A0

const int DryVal = 3366;
const int WetVal = 1320;

int moistureVal;
int moisturePercent;


void setup() {
 Serial.begin(9600);
}

void loop() {
  moistureVal = analogRead(SENSOR_IN);


  moisturePercent = map(moistureVal, DryVal, WetVal, 0, 100);
  moisturePercent = constrain(moisturePercent, 0, 100);

  StaticJsonDocument<128> mesuarements;
  mesuarements["MoisturePercent"] = moisturePercent;
  mesuarements["RawMoisture"] = moistureVal;

  serializeJson(mesuarements, Serial);
  Serial.println();

  delay(10000);
}