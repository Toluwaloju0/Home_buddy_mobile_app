"""Apartment model and save helper"""

from pydantic import BaseModel

from models.base_model import Basemodel
from database.db_engine import storage
from utils.responses import function_response


class ApartmentCreate(BaseModel):
    title: str
    description: str | None = None
    price: float | int
    images: list[str] | None = []
    location: str | None = None


class Apartment(Basemodel):
    title: str | None = None
    description: str | None = None
    price: float | None = None
    images: list | None = None
    location: str | None = None

    def __init__(self, **kwargs):
        super().__init__()
        for key, val in kwargs.items():
            setattr(self, key, val)

    def save(self):
        """Save apartment to database via storage"""

        save_response = storage.save_apartment(**self.to_dict())
        if not save_response.status:
            return function_response(False)
        return save_response
