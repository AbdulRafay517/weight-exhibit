# Backend (FastAPI)

## Overview

This backend service reads weight/mass data from the ESP32 via serial, validates and parses it, and exposes it via REST and WebSocket APIs for the frontend.

## Structure

- `app/main.py`: FastAPI entrypoint
- `app/serial_reader.py`: Serial port reading and JSON parsing
- `app/models.py`: Pydantic models for data validation
- `app/websocket_manager.py`: WebSocket connection management

## Running the Backend

1. Install dependencies:

   ```sh
   pip install -r requirements.txt
   ```

2. Start the server:

   ```sh
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Configuration

- Serial port and baudrate can be set in `main.py` when initializing `SerialReader`.

## API

- `GET /api/weight`: Latest weight/mass data
- `WS /ws`: Real-time updates
