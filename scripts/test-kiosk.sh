#!/bin/bash

# Weight Exhibit Kiosk Test Script
# Verifies that all components are working correctly

set -e

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

echo_info "Weight Exhibit Kiosk Mode Test"
echo_info "==============================="

# Test 1: Check if backend service is running
echo_info "Testing backend service..."
if systemctl is-active --quiet weight-exhibit-backend.service; then
    echo_info "✓ Backend service is running"
else
    echo_error "✗ Backend service is not running"
    echo "  Try: sudo systemctl start weight-exhibit-backend.service"
fi

# Test 2: Check if backend health endpoint responds
echo_info "Testing backend health endpoint..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo_info "✓ Backend health endpoint is responding"
    # Show health status
    health_response=$(curl -s http://localhost:8000/health)
    echo "  Health status: $health_response"
else
    echo_error "✗ Backend health endpoint is not responding"
    echo "  Check backend logs: sudo journalctl -u weight-exhibit-backend.service"
fi

# Test 3: Check if frontend service is running
echo_info "Testing frontend service..."
if systemctl is-active --quiet weight-exhibit-frontend.service; then
    echo_info "✓ Frontend service is running"
else
    echo_error "✗ Frontend service is not running"
    echo "  Try: sudo systemctl start weight-exhibit-frontend.service"
fi

# Test 4: Check if frontend is accessible
echo_info "Testing frontend accessibility..."
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo_info "✓ Frontend is accessible on port 5173"
else
    echo_warning "⚠ Frontend may still be starting up (this can take 30-60 seconds)"
    echo "  Check frontend logs: sudo journalctl -u weight-exhibit-frontend.service"
fi

# Test 5: Check if Chromium is running in kiosk mode
echo_info "Testing Chromium kiosk mode..."
if pgrep -f "chromium.*kiosk" > /dev/null; then
    echo_info "✓ Chromium is running in kiosk mode"
else
    echo_warning "⚠ Chromium kiosk mode is not running"
    echo "  This is normal if running via SSH or without display"
fi

# Test 6: Check serial port
echo_info "Testing serial port configuration..."
SERIAL_PORT=${SERIAL_PORT:-"/dev/ttyUSB0"}
if [ -e "$SERIAL_PORT" ]; then
    echo_info "✓ Serial port $SERIAL_PORT exists"
    if [ -r "$SERIAL_PORT" ] && [ -w "$SERIAL_PORT" ]; then
        echo_info "✓ Serial port $SERIAL_PORT is readable and writable"
    else
        echo_warning "⚠ Serial port $SERIAL_PORT exists but may not have correct permissions"
        echo "  Try: sudo usermod -a -G dialout pi"
    fi
else
    echo_warning "⚠ Serial port $SERIAL_PORT does not exist"
    echo "  Available ports:"
    ls -la /dev/tty* 2>/dev/null | grep -E "(USB|ACM)" || echo "  No USB/ACM ports found"
fi

# Test 7: Check system resources
echo_info "Checking system resources..."
cpu_temp=$(vcgencmd measure_temp 2>/dev/null | cut -d= -f2 | cut -d\' -f1 || echo "N/A")
memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
disk_usage=$(df -h / | awk 'NR==2 {print $5}')

echo "  CPU Temperature: ${cpu_temp}°C"
echo "  Memory Usage: ${memory_usage}%"
echo "  Disk Usage: ${disk_usage}"

# Test 8: Check network connectivity
echo_info "Testing network connectivity..."
if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
    echo_info "✓ Internet connectivity is working"
else
    echo_warning "⚠ No internet connectivity detected"
fi

echo_info ""
echo_info "Test Summary:"
echo_info "============="

# Count active services
backend_active=$(systemctl is-active weight-exhibit-backend.service 2>/dev/null || echo "inactive")
frontend_active=$(systemctl is-active weight-exhibit-frontend.service 2>/dev/null || echo "inactive")
backend_health=$(curl -s http://localhost:8000/health > /dev/null 2>&1 && echo "healthy" || echo "unhealthy")

if [ "$backend_active" = "active" ] && [ "$backend_health" = "healthy" ]; then
    echo_info "✓ Backend: Fully operational"
elif [ "$backend_active" = "active" ]; then
    echo_warning "⚠ Backend: Service running but health check failed"
else
    echo_error "✗ Backend: Not running"
fi

if [ "$frontend_active" = "active" ]; then
    echo_info "✓ Frontend: Service running"
else
    echo_error "✗ Frontend: Not running"
fi

echo_info ""
echo_info "For detailed logs, use:"
echo_info "  Backend: sudo journalctl -u weight-exhibit-backend.service -f"
echo_info "  Frontend: sudo journalctl -u weight-exhibit-frontend.service -f"
echo_info "  Health: tail -f /var/log/weight-exhibit-health.log"
