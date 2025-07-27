# Weight Exhibit - Project Planning

## Project Overview
A museum weight exhibit system that displays real-time weight measurements from a sensor connected via serial communication. The system consists of a Python FastAPI backend, React frontend, and Arduino/ESP32 firmware.

## Architecture
- **Backend**: Python FastAPI server handling serial communication and WebSocket connections
- **Frontend**: React application with Vite build system for real-time data display
- **Firmware**: Arduino/ESP32 code for weight sensor data collection
- **Deployment**: Raspberry Pi kiosk mode for museum installation

## File Structure & Conventions
```
weight-exhibit/
├── backend/           # Python FastAPI backend
│   ├── app/          # Main application package
│   │   ├── models.py         # Pydantic data models
│   │   ├── main.py          # FastAPI application
│   │   ├── config.py        # Configuration management
│   │   ├── serial_reader.py # Serial communication
│   │   └── websocket_manager.py # WebSocket handling
│   ├── tests/        # Unit tests (pytest)
│   └── requirements.txt
├── frontend/         # React + Vite frontend
│   ├── src/         # React components
│   └── package.json
├── firmware/        # Arduino/ESP32 code
│   └── src/
├── scripts/         # Deployment and utility scripts
└── kiosk/          # Kiosk mode configuration
```

## Coding Standards
- **Language**: Python (backend), JavaScript/JSX (frontend), C++ (firmware)
- **Style**: PEP8 for Python, ESLint for JavaScript
- **Type Hints**: Required for Python functions
- **Documentation**: Google-style docstrings for all functions
- **Testing**: Pytest for backend, minimum 3 test cases per feature

## Dependencies
- **Backend**: FastAPI, uvicorn, pyserial, pydantic
- **Frontend**: React, Vite, Material-UI, framer-motion
- **System**: Chromium (for kiosk mode), systemd (for service management)

## Deployment Strategy
- Raspberry Pi OS with auto-start services
- Backend runs as systemd service
- Frontend served via Vite build in kiosk browser
- Automatic recovery on system restart

## Configuration
- Environment variables for serial port configuration
- Platform-specific defaults (Windows: COM14, Linux: /dev/ttyUSB0)
- Configurable baudrate (default: 115200)
