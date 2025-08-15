#include "HX711.h"
#include <ArduinoJson.h>

#define DOUT  2
#define CLK   3

// === Your calibration (keep your working values) ===
const long  OFFSET_COUNTS   = -161100;     // <-- use your empty offset
const float COUNTS_PER_GRAM = -11.162211;  // <-- sign that gave you positive kg

// === Zero button ===
const int   BUTTON_PIN      = 10;     // <- change to your button pin
const bool  ACTIVE_HIGH     = true;  // true if pressed reads HIGH (1), false if LOW (0)
const unsigned long DEBOUNCE_MS = 80;

// === Auto-zero (deadband) to suppress tiny drift ===
const float ZERO_DEADBAND_G = 15.0f;  // set 10–20 g as you like

HX711 scale(DOUT, CLK);

// Button state tracking
bool lastStablePressed = false;
bool lastReadPressed   = false;
unsigned long lastBounceTime = 0;

bool readButtonPressed() {
  int raw = digitalRead(BUTTON_PIN);
  bool pressed = ACTIVE_HIGH ? (raw == HIGH) : (raw == LOW);

  // debounce
  if (pressed != lastReadPressed) {
    lastBounceTime = millis();
    lastReadPressed = pressed;
  }
  if (millis() - lastBounceTime > DEBOUNCE_MS) {
    // stable
    if (pressed != lastStablePressed) {
      lastStablePressed = pressed;
      return pressed; // edge: state changed to pressed or released
    }
  }
  return false; // no edge
}

const struct { const char* name; float g; } planets[] = {
  {"Sun", 274.0}, {"Mercury", 3.7}, {"Earth", 9.807}, {"Moon", 1.62},
  {"Uranus", 8.69}, {"Pluto", 0.62}, {"Pulsar", 1e12}
};

void setup() {
  Serial.begin(115200);

  pinMode(BUTTON_PIN, ACTIVE_HIGH ? INPUT : INPUT_PULLUP);
  // If your wiring needs pullup, use: pinMode(BUTTON_PIN, INPUT_PULLUP); set ACTIVE_HIGH=false

  scale.set_offset(OFFSET_COUNTS);
  scale.set_scale(COUNTS_PER_GRAM);

  // Optional: small settle delay
  delay(300);
}

void loop() {
  // ---- Handle ZERO button (tare once per press) ----
  if (readButtonPressed() && lastStablePressed == true) {
    // Button just pressed: capture new offset from current load
    long newOffset = scale.read_average(15);  // average a few samples
    scale.set_offset(newOffset);

    // Optional: print a one-line status for debugging
    Serial.print(F("{\"event\":\"tare\",\"new_offset\":"));
    Serial.print(newOffset);
    Serial.println(F("}"));
  }

  // ---- Read weight ----
  long  raw    = scale.read_average(5);
  float grams  = scale.get_units(5);
  float massKg = grams / 1000.0f;

  // ---- Auto-deadband (clean small drift) ----
  if (fabs(grams) < ZERO_DEADBAND_G) {
    grams  = 0.0f;
    massKg = 0.0f;
  }

  // ---- JSON output ----
  StaticJsonDocument<512> doc;
  doc["raw"]     = raw;
  doc["grams"]   = grams;
  doc["mass_kg"] = massKg;

  JsonObject wN = doc.createNestedObject("weights_newton");
  for (auto &p : planets) wN[p.name] = massKg * p.g;

  serializeJson(doc, Serial);
  Serial.println();

  delay(200);
}
