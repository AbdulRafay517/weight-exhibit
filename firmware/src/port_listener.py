import serial

# Adjust COM port and baud rate as needed
ser = serial.Serial('COM14', 115200, timeout=1)

print("Listening on COM14...")

try:
    while True:
        if ser.in_waiting:
            line = ser.readline().decode('utf-8', errors='ignore').strip()
            print(f"Received: {line}")
except KeyboardInterrupt:
    ser.close()
    print("\nPort closed.")
