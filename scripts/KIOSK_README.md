# Raspberry Pi Kiosk Mode Setup

This guide explains how to set up the Weight Exhibit to run in kiosk mode on a Raspberry Pi, perfect for museum installations.

## Prerequisites

- Raspberry Pi 4 (recommended) or Raspberry Pi 3B+
- Raspberry Pi OS (Bullseye or newer) with desktop environment
- Internet connection for package installation
- Weight sensor hardware connected via USB/Serial

## Quick Installation

1. **Clone/copy the project** to your Raspberry Pi:
   ```bash
   # If using git:
   git clone <your-repo-url> weight-exhibit
   cd weight-exhibit
   
   # Or copy the project folder to /home/pi/weight-exhibit
   ```

2. **Run the installation script**:
   ```bash
   cd scripts
   sudo bash install-kiosk.sh
   ```

3. **Reboot the system**:
   ```bash
   sudo reboot
   ```

After reboot, the system will automatically:
- Start the backend service
- Launch the frontend in fullscreen kiosk mode
- Hide the mouse cursor
- Disable screen blanking

## Manual Installation Steps

If you prefer to understand each step:

### 1. System Dependencies
```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nodejs npm chromium-browser unclutter xdotool x11-xserver-utils
```

### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run build  # For production build
```

### 4. Create Services
The installation script creates two systemd services:
- `weight-exhibit-backend.service` - Python backend
- `weight-exhibit-frontend.service` - Chromium kiosk mode

### 5. Configure Auto-login
The script configures the Pi to automatically login and start the GUI.

## Configuration

### Serial Port Configuration
Edit the backend configuration if your weight sensor uses a different port:

```bash
# Set environment variable
export SERIAL_PORT="/dev/ttyUSB0"  # or /dev/ttyACM0, etc.
export SERIAL_BAUDRATE="115200"

# Or edit backend/app/config.py
```

### Display Configuration
For different screen resolutions or orientations, edit `/boot/config.txt`:

```bash
# For portrait mode
display_rotate=1

# For different resolution
hdmi_group=2
hdmi_mode=82  # 1920x1080 60Hz
```

## Service Management

### Control Services
```bash
# Start services
sudo /home/pi/weight-exhibit/scripts/start.sh

# Stop services
sudo /home/pi/weight-exhibit/scripts/stop.sh

# Check status
sudo /home/pi/weight-exhibit/scripts/status.sh
```

### Manual Service Commands
```bash
# Backend service
sudo systemctl start weight-exhibit-backend.service
sudo systemctl stop weight-exhibit-backend.service
sudo systemctl status weight-exhibit-backend.service

# Frontend service
sudo systemctl start weight-exhibit-frontend.service
sudo systemctl stop weight-exhibit-frontend.service
sudo systemctl status weight-exhibit-frontend.service
```

### View Logs
```bash
# Backend logs
sudo journalctl -u weight-exhibit-backend.service -f

# Frontend logs
sudo journalctl -u weight-exhibit-frontend.service -f

# Health check logs
tail -f /var/log/weight-exhibit-health.log
```

## Troubleshooting

### Common Issues

**1. Backend won't start**
- Check serial port permissions: `sudo usermod -a -G dialout pi`
- Verify serial port exists: `ls -la /dev/tty*`
- Check backend logs: `sudo journalctl -u weight-exhibit-backend.service`

**2. Frontend won't display**
- Ensure X server is running: `echo $DISPLAY`
- Check if Chromium can start: `chromium-browser --version`
- Verify frontend logs: `sudo journalctl -u weight-exhibit-frontend.service`

**3. Touch screen not working**
- Install touch drivers: `sudo apt install xserver-xorg-input-evdev`
- Configure touch in `/usr/share/X11/xorg.conf.d/`

**4. Screen blanking still occurs**
- Add to `/home/pi/.xsessionrc`:
  ```bash
  xset s off
  xset -dpms
  xset s noblank
  ```

### Health Monitoring
The system includes automatic health checks every 5 minutes:
- Monitors backend API health endpoint
- Monitors frontend responsiveness  
- Automatically restarts failed services

### Recovery Procedures

**Reset to working state:**
```bash
sudo systemctl restart weight-exhibit-backend.service
sudo systemctl restart weight-exhibit-frontend.service
```

**Emergency access:**
- Connect keyboard and press `Ctrl+Alt+F1` to access terminal
- Or SSH into the Pi if network is configured

**Disable kiosk mode temporarily:**
```bash
sudo systemctl disable weight-exhibit-frontend.service
sudo reboot
```

## Network Configuration

### Remote Access
To access the exhibit remotely:

1. **Enable SSH** (if not already enabled):
   ```bash
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```

2. **Configure WiFi** in `/etc/wpa_supplicant/wpa_supplicant.conf`:
   ```
   network={
       ssid="YourNetworkName"
       psk="YourPassword"
   }
   ```

3. **Access via browser** from another device:
   - Frontend: `http://PI_IP_ADDRESS:5173`
   - Backend API: `http://PI_IP_ADDRESS:8000`

### Firewall Configuration
```bash
# Allow access to the application ports
sudo ufw allow 8000  # Backend
sudo ufw allow 5173  # Frontend
sudo ufw enable
```

## Customization

### Startup Splash Screen
Create a custom splash screen by editing `/usr/share/plymouth/themes/pix/splash.png`

### Auto-update from Git
Add to crontab for automatic updates:
```bash
# Update every night at 2 AM
0 2 * * * cd /home/pi/weight-exhibit && git pull && sudo systemctl restart weight-exhibit-backend.service weight-exhibit-frontend.service
```

### Custom Kiosk URL
Edit `/home/pi/weight-exhibit/scripts/start-kiosk.sh` and change the URL:
```bash
# Change from:
http://localhost:5173

# To your custom URL:
http://your-custom-url.com
```

## Security Considerations

- Change default Pi password: `passwd`
- Disable unused services: `sudo systemctl disable bluetooth`
- Configure firewall rules as needed
- Consider VPN for remote access instead of exposing ports

## Performance Optimization

### For better performance:
```bash
# Increase GPU memory split
echo "gpu_mem=128" | sudo tee -a /boot/config.txt

# Disable unnecessary services
sudo systemctl disable triggerhappy.service
sudo systemctl disable avahi-daemon.service
```

### Monitor resource usage:
```bash
# Check CPU and memory
htop

# Check disk usage  
df -h

# Check temperature
vcgencmd measure_temp
```

## Support

For issues or questions:
1. Check the logs using commands above
2. Verify hardware connections
3. Test individual components (backend/frontend) separately
4. Check GitHub issues or create a new one

---

**Note**: This setup is designed for museum/kiosk environments where the system should run continuously and restart automatically on any failures.
