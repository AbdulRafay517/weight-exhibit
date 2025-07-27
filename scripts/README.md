# Weight Exhibit - Kiosk Mode Deployment

This directory contains all the scripts and documentation needed to deploy the Weight Exhibit in kiosk mode on a Raspberry Pi for museum installations.

## Quick Start

1. **Copy the entire project** to your Raspberry Pi at `/home/pi/weight-exhibit`

2. **Run the installation script**:
   ```bash
   cd /home/pi/weight-exhibit/scripts
   sudo bash install-kiosk.sh
   ```

3. **Reboot the system**:
   ```bash
   sudo reboot
   ```

The system will automatically start in kiosk mode after reboot.

## Files in this Directory

### Installation Scripts
- **`install-kiosk.sh`** - Quick installation script (run this first)
- **`setup-kiosk.sh`** - Main setup script with all configuration steps
- **`test-kiosk.sh`** - Test script to verify installation

### Management Scripts  
- **`start.sh`** - Start both backend and frontend services
- **`stop.sh`** - Stop both services
- **`status.sh`** - Check service status
- **`health-check.sh`** - Automated health monitoring (runs via cron)
- **`start-kiosk.sh`** - Frontend kiosk startup script (auto-generated)

### Documentation
- **`KIOSK_README.md`** - Comprehensive setup and troubleshooting guide
- **`README.md`** - This file

## What the Installation Does

The installation script automatically:

1. **Installs system dependencies**: Python, Node.js, Chromium, utilities
2. **Sets up Python environment**: Creates virtual environment and installs packages
3. **Builds frontend**: Installs npm dependencies and builds the React app
4. **Creates systemd services**: 
   - `weight-exhibit-backend.service` - Python FastAPI backend
   - `weight-exhibit-frontend.service` - Chromium kiosk mode frontend
5. **Configures auto-login**: Pi user automatically logs in on boot
6. **Sets up health monitoring**: Automatic service restart on failures
7. **Creates management scripts**: Easy start/stop/status commands

## Service Architecture

```
System Boot
    ↓
Auto-login (pi user)
    ↓
X Server starts
    ↓
Backend Service starts
    ↓
Frontend Service waits for backend
    ↓
Chromium launches in kiosk mode
    ↓
Display shows weight exhibit
```

## Monitoring and Health Checks

- **Health endpoint**: `http://localhost:8000/health`
- **Frontend check**: `http://localhost:5173`
- **Automatic monitoring**: Every 5 minutes via cron job
- **Service restart**: Automatic on failure
- **Logs**: Available via `journalctl` and `/var/log/weight-exhibit-health.log`

## Customization

### Change Serial Port
```bash
export SERIAL_PORT="/dev/ttyACM0"  # or your specific port
sudo systemctl restart weight-exhibit-backend.service
```

### Change Display Settings
Edit `/boot/config.txt` for resolution/orientation changes.

### Modify Startup Behavior
Edit `scripts/start-kiosk.sh` to customize Chromium parameters or startup sequence.

## Troubleshooting

### Quick Diagnostics
```bash
# Run the test script
./test-kiosk.sh

# Check service status
./status.sh

# View live logs
sudo journalctl -u weight-exhibit-backend.service -f
sudo journalctl -u weight-exhibit-frontend.service -f
```

### Common Issues

1. **Backend won't start**: Check serial port permissions and configuration
2. **Frontend shows blank screen**: Wait 30-60 seconds for startup, check logs
3. **Touch not working**: Install touch drivers and configure X11
4. **Screen blanking**: Modify power management settings

See `KIOSK_README.md` for detailed troubleshooting.

## Testing

Run the included tests to verify functionality:

```bash
# Test the installation
./test-kiosk.sh

# Test backend health endpoint (requires pytest)
cd ../backend/app
python -m pytest test_health_endpoint.py -v
```

## Security Notes

- Change default Pi password before deployment
- Configure firewall if network access is needed
- Consider VPN for remote administration
- Disable unnecessary services for security

## Support

For issues:
1. Check `KIOSK_README.md` for detailed troubleshooting
2. Run `test-kiosk.sh` to diagnose problems
3. Check service logs with `journalctl`
4. Review GitHub issues or create new ones

---

**Perfect for museum installations** - Boots automatically, recovers from failures, and provides a clean full-screen experience.
