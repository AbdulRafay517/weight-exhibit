"""
WebSocketManager: Handles WebSocket connections and broadcasting.
"""
from fastapi import WebSocket
from typing import List

class WebSocketManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Failed to send message to WebSocket: {e}")
                disconnected.append(connection)
        
        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)
    
    async def close_all(self):
        """Close all active WebSocket connections."""
        for connection in self.active_connections.copy():
            try:
                await connection.close()
            except Exception as e:
                print(f"Error closing WebSocket connection: {e}")
        self.active_connections.clear()
