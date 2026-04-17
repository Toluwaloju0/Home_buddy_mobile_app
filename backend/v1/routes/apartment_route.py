"""Routes for apartment CRUD (minimal)"""

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from models.apartment_model import ApartmentCreate, Apartment
from database.db_engine import storage
from utils.responses import api_response

apartment = APIRouter(prefix="/apartments", tags=["Apartments"])


@apartment.post("/")
async def create_apartment(apartment_data: ApartmentCreate):
    """Create a new apartment (minimal)"""

    apt = Apartment(
        title=apartment_data.title,
        description=apartment_data.description,
        price=apartment_data.price,
        images=apartment_data.images or [],
        location=apartment_data.location,
    )

    save_response = apt.save()
    if not save_response.status:
        content = api_response(False, "Failed to save apartment")
        return JSONResponse(content.to_dict(), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    content = api_response(True, "Apartment created", {"apartment_id": str(save_response.payload.get("apartment_id"))})
    return JSONResponse(content.to_dict(), status_code=status.HTTP_201_CREATED)


@apartment.get("/")
async def list_apartments():
    """List apartments"""

    get_resp = storage.get_apartments()
    if not get_resp.status:
        content = api_response(False, "Failed to fetch apartments")
        return JSONResponse(content.to_dict(), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    content = api_response(True, "Apartments fetched", get_resp.payload)
    return JSONResponse(content.to_dict(), status_code=status.HTTP_200_OK)
