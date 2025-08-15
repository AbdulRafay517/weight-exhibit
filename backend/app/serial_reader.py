"""
SerialReader: Handles serial port reading and JSON parsing from ESP32.
"""
import serial
import threading
import json
import time
import platform
import logging
from typing import Optional
import copy

class SerialReader:
    def __init__(self, port: str, baudrate: int = 115200):
        self.port = port
        self.baudrate = baudrate
        self._lock = threading.RLock()  # Use RLock for better concurrency
        self._latest_data = None
        self._running = True
        self._serial = None
        self._thread = None
        self._read_timeout = 0.1  # Short timeout to prevent blocking
        self._start_reader()
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()
        return False
    
    def __del__(self):
        """Destructor to ensure cleanup on garbage collection."""
        try:
            self.stop()
        except Exception:
            pass  # Ignore exceptions during cleanup

    def _start_reader(self):
        def _reader():
            logger = logging.getLogger("SerialReader")
            logger.setLevel(logging.DEBUG)
            retry_count = 0
            max_retries = 3
            
            while self._running:
                time.sleep(0.1)  # Prevent CPU spinning too fast
                try:
                    if self._serial is None:
                        print(f"Attempting to connect to serial port: {self.port}")
                        self._serial = serial.Serial(self.port, self.baudrate, timeout=self._read_timeout)
                        print(f"Successfully connected to {self.port}")
                        retry_count = 0
                    
                    if not self._running:
                        break
                    
                    try:
                        # Use non-blocking read with timeout
                        if self._serial.in_waiting > 0:  # Check if data is available
                            line = self._serial.readline().decode('utf-8', errors='ignore').strip()
                            if line:
                                try:
                                    data = json.loads(line)
                                    # Validate the data structure
                                    if self._validate_data(data):
                                        # Use the internal update method for thread-safe updates
                                        self._update_data(data)
                                    else:
                                        logger.debug(f"Invalid data structure: {data}")
                                except json.JSONDecodeError as e:
                                    logger.debug(f"JSON decode error: {e}. Raw data: {line}")
                                    continue
                        else:
                            # No data available, continue to next iteration
                            continue
                    except (UnicodeDecodeError, OSError) as e:
                        # Handle read errors that might occur during shutdown
                        if not self._running:
                            break
                        logger.error(f"Read error: {e}")
                        continue
                            
                except serial.SerialException as e:
                    logger.error(f"Serial port error: {e}")
                    if "could not open port" in str(e):
                        retry_count += 1
                        if retry_count <= max_retries:
                            print(f"Retrying connection in 5 seconds... (attempt {retry_count}/{max_retries})")
                            self._suggest_port_alternatives()
                            time.sleep(5)
                        else:
                            print("Max retries reached. Serial connection failed.")
                            break
                    self._serial = None
                    
                except Exception as e:
                    print(f"Error reading from serial port: {e}")
                    if not self._running:
                        break
                    continue
                    
        self._thread = threading.Thread(target=_reader, daemon=True)
        self._thread.start()
    
    def _validate_data(self, data):
        """Validate that the data has the expected Arduino structure."""
        if not isinstance(data, dict):
            return False
        required_fields = ["raw", "grams", "mass_kg", "weights_newton"]
        for field in required_fields:
            if field not in data:
                return False
        if not isinstance(data["raw"], (int, float)):
            return False
        if not isinstance(data["grams"], (int, float)):
            return False
        if not isinstance(data["mass_kg"], (int, float)):
            return False
        if not isinstance(data["weights_newton"], dict):
            return False
        for k in ["Sun", "Mercury", "Earth", "Moon", "Uranus", "Pluto", "Pulsar"]:
            if k not in data["weights_newton"]:
                return False
            if not isinstance(data["weights_newton"][k], (int, float)):
                return False
        return True
    
    def _suggest_port_alternatives(self):
        """Suggest alternative serial ports based on the operating system."""
        system = platform.system().lower()
        
        if system == "windows":
            print("Common Windows serial ports: COM1, COM2, COM3, COM4, COM5")
            print("You can check available ports with: Get-WmiObject -query 'SELECT * FROM Win32_PnPEntity' | Where-Object {$_.Name -match 'COM\\d+'}")
        elif system == "linux":
            print("Common Linux serial ports: /dev/ttyUSB0, /dev/ttyUSB1, /dev/ttyACM0, /dev/ttyACM1")
            print("You can check available ports with: ls /dev/tty*")
        elif system == "darwin":
            print("Common macOS serial ports: /dev/cu.usbserial-*, /dev/cu.usbmodem*")
            print("You can check available ports with: ls /dev/cu.*")
        
        print(f"Current port setting: {self.port}")
        print("You can override this by setting the SERIAL_PORT environment variable.")

    @property
    def latest_data(self) -> Optional[dict]:
        """Get the latest data safely with minimal lock contention."""
        try:
            # Use a very short timeout to prevent blocking
            if self._lock.acquire(timeout=0.01):
                try:
                    # Return a deep copy to prevent external modification
                    return copy.deepcopy(self._latest_data) if self._latest_data else None
                finally:
                    self._lock.release()
            else:
                # If we can't acquire the lock quickly, return None to prevent deadlock
                # This is safer than returning potentially corrupted data
                return None
        except Exception:
            # If any error occurs, return None to prevent crashes
            return None

    def _update_data(self, data: dict):
        """Internal method to update data with proper locking."""
        try:
            with self._lock:
                self._latest_data = data
        except Exception:
            # If locking fails, ignore the update to prevent crashes
            pass
    
    def get_latest_data_safe(self) -> Optional[dict]:
        """Get latest data without blocking - returns None if data is not immediately available."""
        try:
            # Non-blocking attempt to get data
            if self._lock.acquire(blocking=False):
                try:
                    return copy.deepcopy(self._latest_data) if self._latest_data else None
                finally:
                    self._lock.release()
            else:
                # Return None if we can't get the lock immediately
                return None
        except Exception:
            return None
    
    def stop(self):
        """Stop the serial reader and close the connection."""
        print("Stopping serial reader...")
        self._running = False
        
        # Close the serial connection with multiple attempts
        if self._serial:
            try:
                # Try to cancel any pending operations
                self._serial.cancel_read()
            except (AttributeError, Exception):
                # cancel_read might not be available on all platforms
                pass
            
            # Multiple attempts to close the connection
            for attempt in range(3):
                try:
                    # Force close the serial connection
                    if hasattr(self._serial, 'is_open') and self._serial.is_open:
                        self._serial.close()
                        print(f"Serial connection closed on attempt {attempt + 1}.")
                        break
                    elif self._serial:
                        # Connection might already be closed
                        print("Serial connection was already closed.")
                        break
                except Exception as e:
                    print(f"Attempt {attempt + 1} - Error closing serial connection: {e}")
                    if attempt < 2:  # Not the last attempt
                        time.sleep(0.1)  # Brief pause before retry
                    else:
                        # Last attempt - try to force close
                        try:
                            self._serial.__del__()
                        except Exception:
                            pass
            
            self._serial = None
        
        # Wait for the thread to finish with shorter timeout
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2)
            if self._thread.is_alive():
                print("Warning: Serial reader thread did not stop gracefully within timeout.")
                # The thread is daemon, so it will be killed when the main process exits
            else:
                print("Serial reader thread stopped.")
        
        print("Serial reader stop completed.")
