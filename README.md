# Weight Exhibit

A multi-component system for a museum exhibit that measures and displays weight data in real time. The project consists of a backend (Python), frontend (React + Vite), and firmware (Arduino/ESP32) for serial communication with a weight sensor.

## Quick Start for Museum Installation (Raspberry Pi)

For immediate kiosk mode deployment on Raspberry Pi:

```bash
# Copy project to Raspberry Pi and run:
cd scripts
sudo bash install-kiosk.sh
sudo reboot
```

See [`scripts/README.md`](scripts/README.md) for complete kiosk setup documentation.

## Project Structure

```

weight-exhibit/
├── backend/      # FastAPI backend for serial data, API, and websockets
├── frontend/     # React frontend for real-time display
├── firmware/     # Arduino/ESP32 firmware and simulation scripts

```

## Components

### Backend

- **Location:** `backend/`
- **Tech:** Python, FastAPI
- **Features:**
  - Reads weight data from serial port
  - Exposes REST API and WebSocket for real-time updates
  - Handles configuration and data models

### Frontend

- **Location:** `frontend/`
- **Tech:** React, Vite
- **Features:**
  - Real-time display of weight data
  - Connects to backend WebSocket
  - Modern, responsive UI

### Firmware

- **Location:** `firmware/`
- **Tech:** Arduino/ESP32 (C++), Python (simulation)
- **Features:**
  - Reads from weight sensor
  - Sends data over serial to backend
  - Includes simulation scripts for development

## Getting Started

### Backend

1. Navigate to `backend/`
2. Install dependencies:

   ```sh
   pip install -r requirements.txt
   ```

3. Run the server:

   ```sh
   python -m app
   ```

### Frontend

1. Navigate to `frontend/`

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the development server:

   ```sh
   npm run dev
   ```

### Firmware

- Upload `main.ino` to your ESP32/Arduino device.
- Use `sim_esp32_sender.py` for simulating data during development.

## Usage

### Development Mode

- Start the backend and frontend servers.
- Connect the hardware or run the simulation script.
- Open the frontend in your browser to view real-time weight data.

### Production/Museum Mode

- Use the kiosk mode installation for Raspberry Pi (see [`scripts/README.md`](scripts/README.md))
- Automatic startup, monitoring, and recovery
- Full-screen display perfect for museum installations

## License

MIT License

---

**Author:** AbdulRafay517
