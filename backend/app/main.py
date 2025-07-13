from backend.app import config
from fastapi import FastAPI, WebSocket
from .serial_reader import SerialReader
from .models import WeightData
import asyncio

app = FastAPI()
serial_reader = SerialReader(port=config.SERIAL_PORT, baudrate=config.SERIAL_BAUDRATE)

@app.get("/api/weight", response_model=WeightData)
def get_latest_weight():
    return serial_reader.latest_data

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = serial_reader.latest_data
        await websocket.send_json(data)
        await asyncio.sleep(0.5)