"""
SerialReader: Handles serial port reading and JSON parsing from ESP32.
"""
import serial
import threading
import json
from typing import Optional

class SerialReader:
    def __init__(self, port: str, baudrate: int = 115200):
        self.port = port
        self.baudrate = baudrate
        self.latest_data = None
        self._lock = threading.Lock()
        self._start_reader()

    def _start_reader(self):
        def _reader():
            ser = serial.Serial(self.port, self.baudrate, timeout=1)
            while True:
                try:
                    line = ser.readline().decode('utf-8').strip()
                    if line:
                        data = json.loads(line)
                        with self._lock:
                            self.latest_data = data
                except Exception:
                    continue
        t = threading.Thread(target=_reader, daemon=True)
        t.start()

    @property
    def latest_data(self) -> Optional[dict]:
        with self._lock:
            return self._latest_data

    @latest_data.setter
    def latest_data(self, value):
        with self._lock:
            self._latest_data = value
