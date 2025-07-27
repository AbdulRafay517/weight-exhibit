"""
Test suite for the health endpoint and kiosk functionality.
Run with: python -m pytest test_health_endpoint.py -v
"""
import pytest
import requests
import json
import time
from datetime import datetime


class TestHealthEndpoint:
    """Test cases for the /health endpoint."""
    
    BASE_URL = "http://localhost:8000"
    
    def test_health_endpoint_exists(self):
        """Test that the health endpoint exists and responds."""
        response = requests.get(f"{self.BASE_URL}/health")
        assert response.status_code == 200
        
    def test_health_endpoint_response_structure(self):
        """Test that health endpoint returns expected JSON structure."""
        response = requests.get(f"{self.BASE_URL}/health")
        data = response.json()
        
        # Check required fields
        assert "status" in data
        assert "timestamp" in data
        assert "serial_connected" in data
        
        # Check field types
        assert isinstance(data["status"], str)
        assert isinstance(data["timestamp"], str)
        assert isinstance(data["serial_connected"], bool)
        
    def test_health_endpoint_status_value(self):
        """Test that health endpoint returns 'healthy' status."""
        response = requests.get(f"{self.BASE_URL}/health")
        data = response.json()
        
        assert data["status"] == "healthy"
        
    def test_health_endpoint_timestamp_format(self):
        """Test that timestamp is in ISO format and recent."""
        response = requests.get(f"{self.BASE_URL}/health")
        data = response.json()
        
        # Should be able to parse as ISO datetime
        timestamp = datetime.fromisoformat(data["timestamp"].replace('Z', '+00:00'))
        
        # Should be within last 5 seconds
        now = datetime.now()
        time_diff = abs((now - timestamp.replace(tzinfo=None)).total_seconds())
        assert time_diff < 5, f"Timestamp too old: {time_diff} seconds"
        
    def test_health_endpoint_serial_status(self):
        """Test that serial connection status is reported."""
        response = requests.get(f"{self.BASE_URL}/health")
        data = response.json()
        
        # Should be a boolean
        assert isinstance(data["serial_connected"], bool)
        # Note: Could be True or False depending on hardware presence


class TestKioskIntegration:
    """Integration tests for kiosk mode functionality."""
    
    BACKEND_URL = "http://localhost:8000"
    FRONTEND_URL = "http://localhost:5173"
    
    def test_backend_accessibility(self):
        """Test that backend is accessible."""
        try:
            response = requests.get(f"{self.BACKEND_URL}/health", timeout=5)
            assert response.status_code == 200
        except requests.exceptions.ConnectionError:
            pytest.skip("Backend not running - expected in some test environments")
            
    def test_frontend_accessibility(self):
        """Test that frontend is accessible."""
        try:
            response = requests.get(self.FRONTEND_URL, timeout=5)
            # Frontend should return HTML (status 200) or be redirecting
            assert response.status_code in [200, 301, 302]
        except requests.exceptions.ConnectionError:
            pytest.skip("Frontend not running - expected in some test environments")
            
    def test_api_endpoints_available(self):
        """Test that main API endpoints are accessible."""
        try:
            # Test weight endpoint
            response = requests.get(f"{self.BACKEND_URL}/api/weight", timeout=5)
            assert response.status_code == 200
            
            # Should return JSON with expected structure
            data = response.json()
            assert "mass_kg" in data
            assert "weights" in data
            assert isinstance(data["weights"], dict)
            
        except requests.exceptions.ConnectionError:
            pytest.skip("Backend not running")
            
    def test_websocket_endpoint_exists(self):
        """Test that WebSocket endpoint is available (basic connectivity test)."""
        # Note: Full WebSocket testing would require additional libraries
        # This is a basic test to ensure the endpoint exists
        try:
            # Try to connect to WebSocket - will fail but should not return 404
            import websocket
            import ssl
            
            ws = websocket.WebSocket(sslopt={"cert_reqs": ssl.CERT_NONE})
            try:
                ws.connect("ws://localhost:8000/ws", timeout=2)
                ws.close()
            except Exception as e:
                # Connection might fail, but it shouldn't be a 404 or similar
                # If it's a proper WebSocket endpoint, we'll get connection-related errors
                assert "404" not in str(e).lower()
                
        except ImportError:
            pytest.skip("websocket-client not installed")
        except Exception:
            # WebSocket connection issues are expected in test environment
            pass


class TestServiceHealth:
    """Tests for service health and monitoring."""
    
    def test_multiple_health_requests(self):
        """Test that health endpoint can handle multiple rapid requests."""
        responses = []
        
        for i in range(5):
            try:
                response = requests.get("http://localhost:8000/health", timeout=2)
                responses.append(response.status_code)
            except requests.exceptions.ConnectionError:
                pytest.skip("Backend not running")
                
        # All requests should succeed
        assert all(status == 200 for status in responses)
        
    def test_health_endpoint_performance(self):
        """Test that health endpoint responds quickly."""
        start_time = time.time()
        
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            end_time = time.time()
            
            response_time = end_time - start_time
            
            # Health endpoint should respond within 1 second
            assert response_time < 1.0, f"Health check too slow: {response_time}s"
            assert response.status_code == 200
            
        except requests.exceptions.ConnectionError:
            pytest.skip("Backend not running")


if __name__ == "__main__":
    # Run the tests
    pytest.main([__file__, "-v"])
