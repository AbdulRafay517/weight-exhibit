#!/bin/bash

# Weight Exhibit Kiosk Mode Setup Script for Raspberry Pi
# This script sets up the weight exhibit to run in kiosk mode on boot

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"
USER="pi"
HOME_DIR="/home/$USER"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

echo_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo_error "This script must be run as root (use sudo)"
        exit 1
    fi
}

install_dependencies() {
    echo_info "Installing system dependencies..."
    
    # Update package list
    apt-get update
    
    # Install required packages
    apt-get install -y \
        python3 \
        python3-pip \
        python3-venv \
        nodejs \
        npm \
        chromium-browser \
        unclutter \
        xdotool \
        x11-xserver-utils \
        git
    
    echo_info "System dependencies installed successfully"
}

setup_python_environment() {
    echo_info "Setting up Python environment..."
    
    # Create virtual environment for the backend
    sudo -u $USER python3 -m venv "$BACKEND_DIR/venv"
    
    # Install Python dependencies
    sudo -u $USER "$BACKEND_DIR/venv/bin/pip" install -r "$BACKEND_DIR/requirements.txt"
    
    echo_info "Python environment setup complete"
}

setup_frontend() {
    echo_info "Setting up frontend..."
    
    # Install Node.js dependencies
    cd "$FRONTEND_DIR"
    sudo -u $USER npm install
    
    # Build production version
    sudo -u $USER npm run build
    
    echo_info "Frontend setup complete"
}

create_backend_service() {
    echo_info "Creating backend systemd service..."
    
    cat > /etc/systemd/system/weight-exhibit-backend.service << EOF
[Unit]
Description=Weight Exhibit Backend Service
After=network.target
Wants=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$BACKEND_DIR
Environment=PATH=$BACKEND_DIR/venv/bin
ExecStart=$BACKEND_DIR/venv/bin/python -m app
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=weight-exhibit-backend

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable weight-exhibit-backend.service
    
    echo_info "Backend service created and enabled"
}

create_frontend_service() {
    echo_info "Creating frontend systemd service..."
    
    cat > /etc/systemd/system/weight-exhibit-frontend.service << EOF
[Unit]
Description=Weight Exhibit Frontend Kiosk
After=graphical-session.target weight-exhibit-backend.service
Wants=graphical-session.target
Requires=weight-exhibit-backend.service

[Service]
Type=simple
User=$USER
Environment=DISPLAY=:0
WorkingDirectory=$FRONTEND_DIR
ExecStart=/bin/bash $SCRIPT_DIR/start-kiosk.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=weight-exhibit-frontend

[Install]
WantedBy=graphical-session.target
EOF

    systemctl daemon-reload
    systemctl enable weight-exhibit-frontend.service
    
    echo_info "Frontend service created and enabled"
}

create_kiosk_startup_script() {
    echo_info "Creating kiosk startup script..."
    
    cat > "$SCRIPT_DIR/start-kiosk.sh" << 'EOF'
#!/bin/bash

# Weight Exhibit Kiosk Mode Startup Script

# Wait for X server to be ready
while ! xset q &>/dev/null; do
    echo "Waiting for X server..."
    sleep 1
done

# Hide cursor and disable screen blanking
unclutter -idle 0.5 -root &
xset s off
xset -dpms
xset s noblank

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
while ! curl -s http://localhost:8000/health > /dev/null 2>&1; do
    sleep 2
done

# Start the frontend development server in background
cd "$(dirname "$0")/../frontend"
npm run dev &
VITE_PID=$!

# Wait for frontend to be ready
echo "Waiting for frontend to be ready..."
while ! curl -s http://localhost:5173 > /dev/null 2>&1; do
    sleep 2
done

# Function to cleanup on exit
cleanup() {
    echo "Cleaning up..."
    kill $VITE_PID 2>/dev/null || true
    pkill -f chromium 2>/dev/null || true
}

# Set trap for cleanup
trap cleanup EXIT

# Start Chromium in kiosk mode
chromium-browser \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-translate \
    --disable-features=VizDisplayCompositor \
    --start-fullscreen \
    --kiosk \
    --incognito \
    --no-first-run \
    --disable-default-apps \
    --disable-popup-blocking \
    --disable-prompt-on-repost \
    --no-default-browser-check \
    --autoplay-policy=no-user-gesture-required \
    --disable-web-security \
    --disable-features=VizDisplayCompositor \
    http://localhost:5173

# Wait for Chromium to exit
wait
EOF

    chmod +x "$SCRIPT_DIR/start-kiosk.sh"
    chown $USER:$USER "$SCRIPT_DIR/start-kiosk.sh"
    
    echo_info "Kiosk startup script created"
}

configure_auto_login() {
    echo_info "Configuring auto-login..."
    
    # Enable auto-login for pi user
    raspi-config nonint do_boot_behaviour B4
    
    # Configure lightdm for auto-login
    if [ -f /etc/lightdm/lightdm.conf ]; then
        sed -i "s/#autologin-user=/autologin-user=$USER/" /etc/lightdm/lightdm.conf
        sed -i "s/#autologin-user-timeout=0/autologin-user-timeout=0/" /etc/lightdm/lightdm.conf
    fi
    
    echo_info "Auto-login configured"
}

create_health_check_script() {
    echo_info "Creating health check script..."
    
    cat > "$SCRIPT_DIR/health-check.sh" << 'EOF'
#!/bin/bash

# Weight Exhibit Health Check Script
# Checks if services are running and restarts if needed

check_backend() {
    if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo "Backend not responding, restarting service..."
        systemctl restart weight-exhibit-backend.service
        return 1
    fi
    return 0
}

check_frontend() {
    if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo "Frontend not responding, restarting service..."
        systemctl restart weight-exhibit-frontend.service
        return 1
    fi
    return 0
}

main() {
    echo "$(date): Running health check..."
    
    backend_ok=0
    frontend_ok=0
    
    check_backend && backend_ok=1
    check_frontend && frontend_ok=1
    
    if [ $backend_ok -eq 1 ] && [ $frontend_ok -eq 1 ]; then
        echo "$(date): All services healthy"
    else
        echo "$(date): Some services were restarted"
    fi
}

main
EOF

    chmod +x "$SCRIPT_DIR/health-check.sh"
    chown $USER:$USER "$SCRIPT_DIR/health-check.sh"
    
    # Add cron job for health check every 5 minutes
    (crontab -u $USER -l 2>/dev/null; echo "*/5 * * * * $SCRIPT_DIR/health-check.sh >> /var/log/weight-exhibit-health.log 2>&1") | crontab -u $USER -
    
    echo_info "Health check script created and scheduled"
}

create_management_scripts() {
    echo_info "Creating management scripts..."
    
    # Start script
    cat > "$SCRIPT_DIR/start.sh" << EOF
#!/bin/bash
echo "Starting Weight Exhibit services..."
systemctl start weight-exhibit-backend.service
systemctl start weight-exhibit-frontend.service
echo "Services started"
EOF

    # Stop script
    cat > "$SCRIPT_DIR/stop.sh" << EOF
#!/bin/bash
echo "Stopping Weight Exhibit services..."
systemctl stop weight-exhibit-frontend.service
systemctl stop weight-exhibit-backend.service
echo "Services stopped"
EOF

    # Status script
    cat > "$SCRIPT_DIR/status.sh" << EOF
#!/bin/bash
echo "Weight Exhibit Service Status:"
echo "=============================="
echo "Backend:"
systemctl status weight-exhibit-backend.service --no-pager -l
echo ""
echo "Frontend:"
systemctl status weight-exhibit-frontend.service --no-pager -l
EOF

    chmod +x "$SCRIPT_DIR"/{start,stop,status}.sh
    
    echo_info "Management scripts created"
}

add_backend_health_endpoint() {
    echo_info "Adding health endpoint to backend..."
    
    # Check if health endpoint exists in main.py
    if ! grep -q "/health" "$BACKEND_DIR/app/main.py"; then
        echo_warning "Adding health endpoint to backend main.py"
        # This would need to be done manually or with a more sophisticated approach
        echo "Please add a health endpoint to your FastAPI backend:"
        echo ""
        echo "@app.get(\"/health\")"
        echo "async def health():"
        echo "    return {\"status\": \"healthy\", \"timestamp\": datetime.now().isoformat()}"
        echo ""
    fi
}

main() {
    echo_info "Starting Weight Exhibit Kiosk Mode Setup..."
    
    check_root
    install_dependencies
    setup_python_environment
    setup_frontend
    create_backend_service
    create_frontend_service
    create_kiosk_startup_script
    configure_auto_login
    create_health_check_script
    create_management_scripts
    add_backend_health_endpoint
    
    echo_info "Setup complete! The system will start in kiosk mode on next boot."
    echo_info "You can manage the services with:"
    echo_info "  - Start: sudo $SCRIPT_DIR/start.sh"
    echo_info "  - Stop: sudo $SCRIPT_DIR/stop.sh"
    echo_info "  - Status: sudo $SCRIPT_DIR/status.sh"
    echo_info ""
    echo_warning "Please add a health endpoint to your backend if it doesn't exist."
    echo_info "Reboot the system to start kiosk mode."
}

main "$@"
