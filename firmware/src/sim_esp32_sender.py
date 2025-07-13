import serial
import time
import json
import random

def generate_payload():
    mass = round(random.uniform(1, 5), 2)
    gravity = {
        "Earth": 9.807,
        "Moon": 1.62,
        "Sun": 274,
        "Mercury": 3.7,
        "Uranus": 8.69,
        "Pluto": 0.62,
        "Pulsar": 1000  # illustrative
    }
    weights = {body: round(mass * g, 2) for body, g in gravity.items()}
    return json.dumps({"mass_kg": mass, "weights": weights})

# Measure time to open port
start_time = time.time()
try:
    ser = serial.Serial('COM13', 115200, timeout=0.5)
    ser.flush()  # clear input/output buffers
    print(f"Serial port opened in {time.time() - start_time:.3f} seconds.")
except serial.SerialException as e:
    print(f"Failed to open serial port: {e}")
    exit(1)

# Send loop
try:
    while True:
        payload = generate_payload()
        ser.write((payload + '\n').encode('utf-8'))
        print(f"Sent: {payload}")
        time.sleep(2)
except KeyboardInterrupt:
    print("\nInterrupted. Closing serial port.")
    ser.close()
