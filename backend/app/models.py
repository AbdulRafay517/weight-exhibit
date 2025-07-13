"""
Pydantic models for weight data validation.
"""
from pydantic import BaseModel, Field
from typing import Dict

class WeightData(BaseModel):
    mass_kg: float = Field(..., description="Mass in kg")
    weights: Dict[str, float] = Field(..., description="Weights on celestial bodies (N)")
