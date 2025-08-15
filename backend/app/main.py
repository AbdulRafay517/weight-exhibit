from . import config
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from .serial_reader import SerialReader
from .models import ArduinoWeightData
from .websocket_manager import WebSocketManager
import asyncio
import json
import signal
import threading
import atexit
from datetime import datetime
from contextlib import asynccontextmanager

# Global variable to hold the serial reader
serial_reader = None

# Flag to track if cleanup has been performed
cleanup_performed = False
cleanup_lock = threading.Lock()

def cleanup_resources():
    """Cleanup function to ensure serial port is closed properly."""
    global serial_reader, cleanup_performed
    
    with cleanup_lock:
        if cleanup_performed:
            return
        cleanup_performed = True
    
    print("Performing cleanup...")
    
    # Stop the serial reader
    if serial_reader:
        try:
            serial_reader.stop()
            print("Serial reader stopped successfully.")
        except Exception as e:
            print(f"Error stopping serial reader: {e}")
    
    print("Cleanup complete.")

def signal_handler(signum, frame):
    """Handle interrupt signals to ensure proper cleanup."""
    print(f"\nReceived signal {signum}, performing cleanup...")
    cleanup_resources()
    # Re-raise the signal to allow normal shutdown
    signal.signal(signum, signal.SIG_DFL)
    signal.raise_signal(signum)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the serial reader
    global serial_reader
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    if hasattr(signal, 'SIGTERM'):
        signal.signal(signal.SIGTERM, signal_handler)
    
    # Register atexit handler as a final fallback
    atexit.register(cleanup_resources)
    
    serial_reader = SerialReader(port=config.SERIAL_PORT, baudrate=config.SERIAL_BAUDRATE)
    
    try:
        yield
    finally:
        # Shutdown: Clean up resources
        print("Shutting down application...")
        
        try:
            # Close all WebSocket connections
            await websocket_manager.close_all()
        except Exception as e:
            print(f"Error closing WebSocket connections: {e}")
        
        # Perform cleanup (this will be idempotent)
        cleanup_resources()
        
        print("Application shutdown complete.")

app = FastAPI(lifespan=lifespan)
websocket_manager = WebSocketManager()

@app.get("/health")
async def health():
    """Health check endpoint for monitoring and load balancers."""
    serial_connected = False
    if serial_reader:
        try:
            serial_connected = hasattr(serial_reader, '_serial') and serial_reader._serial and serial_reader._serial.is_open
        except Exception:
            serial_connected = False
    
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "serial_connected": serial_connected
    }

@app.get("/debug/raw-data")
def get_raw_data():
    """Debug endpoint to see raw data from serial port"""
    if serial_reader is None:
        return {
            "raw_data": None,
            "data_type": "NoneType",
            "is_none": True,
            "error": "Serial reader not initialized"
        }
    
    # Use the safe method to prevent deadlock
    data = serial_reader.get_latest_data_safe()
    return {
        "raw_data": data,
        "data_type": type(data).__name__,
        "is_none": data is None
    }

@app.get("/api/weight", response_model=ArduinoWeightData)
def get_latest_weight():
    try:
        data = serial_reader.get_latest_data_safe() if serial_reader else None
        if data is None:
            # Return default data if no serial data available
            default_data = {
                "raw": 0.0,
                "grams": 0.0,
                "mass_kg": 0.0,
                "weights_newton": {
                    "Sun": 0.0,
                    "Mercury": 0.0,
                    "Earth": 0.0,
                    "Moon": 0.0,
                    "Uranus": 0.0,
                    "Pluto": 0.0,
                    "Pulsar": 0.0
                }
            }
            print(f"[DEBUG] API returning default data: {default_data}")
            return default_data
        print(f"[DEBUG] API returning serial data: {data}")
        return data
    except Exception as e:
        print(f"Error in get_latest_weight: {e}")
        error_data = {
            "raw": 0.0,
            "grams": 0.0,
            "mass_kg": 0.0,
            "weights_newton": {
                "Sun": 0.0,
                "Mercury": 0.0,
                "Earth": 0.0,
                "Moon": 0.0,
                "Uranus": 0.0,
                "Pluto": 0.0,
                "Pulsar": 0.0
            }
        }
        print(f"[DEBUG] API returning error fallback data: {error_data}")
        return error_data

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            try:
                # Use the safe method to prevent blocking/deadlock
                data = serial_reader.get_latest_data_safe() if serial_reader else None
                if data is None:
                    # Send default data if no serial data available
                    default_data = {
                        "raw": 0.0,
                        "grams": 0.0,
                        "mass_kg": 0.0,
                        "weights_newton": {
                            "Sun": 0.0,
                            "Mercury": 0.0,
                            "Earth": 0.0,
                            "Moon": 0.0,
                            "Uranus": 0.0,
                            "Pluto": 0.0,
                            "Pulsar": 0.0
                        }
                    }
                    print(f"[DEBUG] Sending default data: {default_data}")
                    await websocket.send_json(default_data)
                else:
                    print(f"[DEBUG] Sending serial data: {data}")
                    await websocket.send_json(data)
            except Exception as e:
                print(f"Error getting serial data in WebSocket: {e}")
                # Send default data on error
                default_data = {
                    "raw": 0.0,
                    "grams": 0.0,
                    "mass_kg": 0.0,
                    "weights_newton": {
                        "Sun": 0.0,
                        "Mercury": 0.0,
                        "Earth": 0.0,
                        "Moon": 0.0,
                        "Uranus": 0.0,
                        "Pluto": 0.0,
                        "Pulsar": 0.0
                    }
                }
                print(f"[DEBUG] Sending error fallback data: {default_data}")
                await websocket.send_json(default_data)
            await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)
    except asyncio.CancelledError:
        print("WebSocket connection cancelled")
        websocket_manager.disconnect(websocket)
        raise
    except Exception as e:
        print(f"WebSocket error: {e}")
        websocket_manager.disconnect(websocket)
