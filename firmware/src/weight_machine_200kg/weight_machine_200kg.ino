// ================== HX711 + TARE BUTTON (pressed = HIGH) ==================
#define DT   2
#define SCK  3
#define BTN  10   // Tare/Zero button → VCC (use 10k pulldown to GND)

// ---- User setting: your calibration mass in grams (for reference) ----
const float CAL_MASS_G = 57000.0;

// Internals (your values)
long  offset = 8547498;   // current manual offset
float scale  = 11.165f;   // counts per gram
long  lastRaw = 0;

// Change in offset for 10 grams (≈110 counts)
long offsetChangePer10g = 110;

// Debounce
unsigned long lastBtnMs = 0;
const unsigned long debounceMs = 60;
bool lastBtnState = LOW;   // with pulldown: LOW = not pressed

// --- Prototypes
unsigned long readRawOnce();
long  readRawAvg(uint8_t n = 10);
float readWeightGrams();
void  tareNow(uint8_t avgSamples = 20);

void setup() {
  Serial.begin(9600);
  pinMode(SCK, OUTPUT);
  pinMode(DT, INPUT);

  // Button is wired to VCC with a 10k pulldown → stable LOW idle, HIGH on press
  pinMode(BTN, INPUT);

  Serial.println(F("HX711 scale starting..."));
  Serial.print(F("Offset: ")); Serial.println(offset);
  Serial.print(F("Scale (counts/gram): ")); Serial.println(scale, 3);
  Serial.println(F("Use '+' to increase offset by 10 g, '-' to decrease by 10 g"));
  Serial.println(F("Press the button to ZERO/TARE the scale."));

  // Optional: auto-tare on startup if near zero load
  long r = (long)readRawAvg(15);
  float g = (r - offset) / scale;
  if (g > -100 && g < 100) {
    offset = r;
    Serial.print(F("Auto-tare on startup. New offset: "));
    Serial.println(offset);
  }
}

void loop() {
  // ----- Serial +/- trim for coarse alignment -----
  if (Serial.available()) {
    char c = Serial.read();
    if (c == '+') {
      offset += offsetChangePer10g;
      Serial.print(F("Offset +10 g → ")); Serial.println(offset);
    } else if (c == '-') {
      offset -= offsetChangePer10g;
      Serial.print(F("Offset -10 g → ")); Serial.println(offset);
    }
  }

  // ----- TARE button (pressed = HIGH) with debounce on edge -----
  bool btnState = digitalRead(BTN); // HIGH when pressed
  unsigned long now = millis();
  if (btnState != lastBtnState && (now - lastBtnMs) > debounceMs) {
    lastBtnMs = now;
    lastBtnState = btnState;

    if (btnState == HIGH) {        // pressed
      tareNow(20);                 // average 20 samples for clean zero
    }
  }

  // ----- Read & print weight -----
  float g = readWeightGrams();
  if (g < 0 && g > -100) g = 0;    // clamp tiny negatives to 0

  Serial.print(F("Weight: "));
  Serial.print((long)g);
  Serial.print(F(" g ("));
  Serial.print(g / 1000.0f, 3);
  Serial.println(F(" kg)"));

  delay(300);
}

// ================== Functions ==================

// Instantly set current reading as zero (tare)
void tareNow(uint8_t avgSamples) {
  long r = readRawAvg(avgSamples);
  offset = r; // (raw - offset) → 0
  Serial.print(F("TARE done. New offset: "));
  Serial.println(offset);
  Serial.println(F("Make sure platform is empty when you press TARE."));
}

// Read one 24-bit sample from HX711
unsigned long readRawOnce() {
  unsigned long Count = 0;
  while (digitalRead(DT));            // wait until ready (DOUT LOW)
  for (uint8_t i = 0; i < 24; i++) {
    digitalWrite(SCK, HIGH);
    Count <<= 1;
    digitalWrite(SCK, LOW);
    if (digitalRead(DT)) Count++;
  }
  digitalWrite(SCK, HIGH);
  digitalWrite(SCK, LOW);             // set gain = 128 (channel A)
  Count ^= 0x800000;                  // two's complement handling
  return Count;
}

// Average N samples
long readRawAvg(uint8_t n) {
  long sum = 0;
  for (uint8_t i = 0; i < n; i++) {
    sum += (long)readRawOnce();
    delay(2);
  }
  return sum / (long)n;
}

// Convert to grams
float readWeightGrams() {
  lastRaw = readRawAvg(10);
  float grams = (lastRaw - offset) / scale;
  if (grams < 0 && grams > -100) grams = 0; // small negatives → 0
  return grams;
}
