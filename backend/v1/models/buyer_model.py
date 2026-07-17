""" a module to create the buyer schema"""

from pydantic import BaseModel
from typing import List

class Buyer(BaseModel):
    state: str | None = None
    LGA: str | None = None
    max_price: int | None = None
    min_price: int | None = None
    max_size: int | None = None
    min_size: int | None = None
    amenities: List | None = None
    property_type: str | None = None