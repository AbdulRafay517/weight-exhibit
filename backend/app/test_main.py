"""
Unit tests for /api/weight endpoint with new Arduino JSON structure.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

def test_api_weight_default():
    client = TestClient(app)
    response = client.get("/api/weight")
    assert response.status_code == 200
    data = response.json()
    assert set(data.keys()) == {"raw", "grams", "mass_kg", "weights_newton"}
    for k in ["Sun", "Mercury", "Earth", "Moon", "Uranus", "Pluto", "Pulsar"]:
        assert k in data["weights_newton"]

# Edge case: Simulate serial_reader returning negative values
# This would require mocking serial_reader.get_latest_data_safe
import app.main as main_mod

def test_api_weight_negative(monkeypatch):
    def mock_get_latest_data_safe():
        return {
            "raw": -153425,
            "grams": -671.1932,
            "mass_kg": -0.671193,
            "weights_newton": {
                "Sun": -183.9069,
                "Mercury": -2.483415,
                "Earth": -6.582392,
                "Moon": -1.087333,
                "Uranus": -5.832668,
                "Pluto": -0.41614,
                "Pulsar": -6.711932e11
            }
        }
    monkeypatch.setattr(main_mod.serial_reader, "get_latest_data_safe", mock_get_latest_data_safe)
    client = TestClient(main_mod.app)
    response = client.get("/api/weight")
    assert response.status_code == 200
    data = response.json()
    assert data["raw"] == -153425
    assert data["grams"] == -671.1932
    assert data["weights_newton"]["Pulsar"] == -6.711932e11

# Failure case: Simulate serial_reader being None

def test_api_weight_none(monkeypatch):
    monkeypatch.setattr(main_mod, "serial_reader", None)
    client = TestClient(main_mod.app)
    response = client.get("/api/weight")
    assert response.status_code == 200
    data = response.json()
    assert data["raw"] == 0.0
    assert data["grams"] == 0.0
    assert data["weights_newton"]["Sun"] == 0.0
