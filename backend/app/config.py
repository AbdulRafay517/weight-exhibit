"""
Configuration loader for backend (env or defaults).
"""
import os

SERIAL_PORT = os.getenv("SERIAL_PORT", "/dev/ttyUSB0")
SERIAL_BAUDRATE = int(os.getenv("SERIAL_BAUDRATE", "115200"))
