#include "HX711.h"
#include <ArduinoJson.h>

#define DOUT  4
#define CLK  5

HX711 scale;
float calibration_factor = 2280.0; // To be calibrated

const struct {
  const char* name;
  float gravity;
} planets[] = {
  {"Sun", 274.0},
  {"Mercury", 3.7},
  {"Earth", 9.807},
  {"Moon", 1.62},
  {"Uranus", 8.69},
  {"Pluto", 0.62},
  {"Pulsar", 1e12}
};

void setup() {
  Serial.begin(115200);
  scale.begin(DOUT, CLK);
  scale.set_scale(calibration_factor);
  scale.tare();
}

void loop() {
  float weight_earth = scale.get_units(5);
  float mass = weight_earth / 9.807;

  StaticJsonDocument<512> doc;
  doc["mass"] = mass;
  JsonObject weights = doc.createNestedObject("weights");
  for (auto& planet : planets) {
    weights[planet.name] = mass * planet.gravity;
  }
  serializeJson(doc, Serial);
  Serial.println();
  delay(500);
}