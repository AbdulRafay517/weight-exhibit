"""
Pydantic models for weight data validation.
"""
from pydantic import BaseModel, Field
from typing import Dict

class WeightsNewton(BaseModel):
    Sun: float
    Mercury: float
    Earth: float
    Moon: float
    Uranus: float
    Pluto: float
    Pulsar: float

class ArduinoWeightData(BaseModel):
    raw: float = Field(..., description="Raw sensor value (can be negative)")
    grams: float = Field(..., description="Weight in grams (can be negative)")
    mass_kg: float = Field(..., description="Mass in kg (can be negative)")
    weights_newton: WeightsNewton = Field(..., description="Weights on celestial bodies (N), can be negative")
