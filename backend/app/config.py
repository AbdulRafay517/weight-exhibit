"""
Configuration loader for backend (env or defaults).
"""
import os
import platform

def get_default_serial_port():
    """Get the default serial port based on the operating system."""
    system = platform.system().lower()
    
    if system == "windows":
        # Windows uses COM ports
        return "COM14"  # Common default, can be overridden with env var
    elif system == "linux":
        # Linux/Raspberry Pi OS uses /dev/tty devices
        return "/dev/ttyUSB0"  # Common for USB-to-serial adapters
    elif system == "darwin":  # macOS
        return "/dev/cu.usbserial-0001"  # Common macOS serial port
    else:
        # Fallback to Linux convention
        return "/dev/ttyUSB0"

SERIAL_PORT = os.getenv("SERIAL_PORT", get_default_serial_port())
SERIAL_BAUDRATE = int(os.getenv("SERIAL_BAUDRATE", "115200"))
