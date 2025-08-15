"""
Unit tests for ArduinoWeightData and WeightsNewton models.
"""
import pytest
from app.models import ArduinoWeightData, WeightsNewton

def test_valid_payload():
    payload = {
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
    data = ArduinoWeightData(**payload)
    assert data.raw == -153425
    assert data.grams == -671.1932
    assert data.mass_kg == -0.671193
    assert data.weights_newton.Sun == -183.9069
    assert data.weights_newton.Pulsar == -6.711932e11

def test_missing_field():
    payload = {
        "raw": 1,
        "grams": 2,
        "mass_kg": 3,
        # Missing weights_newton
    }
    with pytest.raises(Exception):
        ArduinoWeightData(**payload)

def test_invalid_type():
    payload = {
        "raw": "not_a_number",
        "grams": 2,
        "mass_kg": 3,
        "weights_newton": {
            "Sun": 1,
            "Mercury": 2,
            "Earth": 3,
            "Moon": 4,
            "Uranus": 5,
            "Pluto": 6,
            "Pulsar": 7
        }
    }
    with pytest.raises(Exception):
        ArduinoWeightData(**payload)
