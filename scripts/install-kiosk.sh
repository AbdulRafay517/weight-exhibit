#!/bin/bash

# Quick Installation Script for Weight Exhibit Kiosk Mode
# Run this script on your Raspberry Pi as root: sudo bash install-kiosk.sh

set -e

echo "Weight Exhibit Kiosk Mode Installer"
echo "===================================="

# Make setup script executable
chmod +x "$(dirname "$0")/setup-kiosk.sh"

# Run the main setup
bash "$(dirname "$0")/setup-kiosk.sh"

echo ""
echo "Installation complete!"
echo "Reboot your Raspberry Pi to start the kiosk mode."
echo ""
echo "To reboot now, run: sudo reboot"
