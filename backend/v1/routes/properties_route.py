from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import List

from database.db_engine import storage
from middlewares.verify_user import get_user_from_token
from utils.responses import api_response

properties = APIRouter(prefix="/properties", tags=["properties"])

@properties.get("/", summary="List properties")
async def list_properties():
    """Return a minimal properties list placeholder."""
    return {
        "status": True,
        "message": "Properties list (placeholder)",
        "payload": [],
        "meta": {"count": 0},
    }


@properties.get("/search", summary="Search seller's listings")
async def search_listings(q: str = Query(..., min_length=1), user_response=Depends(get_user_from_token)):
    """Search for listings by title, description, or location for the authenticated seller."""

    # Verify user authentication
    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    user_id = str(user.get("_id"))

    search_response = await storage.search_seller_listings(user_id, q)
    if not search_response.status:
        content = api_response(False, "Search failed")
        return JSONResponse(content.to_dict(), 500)

    results = search_response.payload

    # Convert ObjectId to string for JSON serialization
    for listing in results:
        if "_id" in listing:
            listing["_id"] = str(listing["_id"])
        if "seller_id" in listing:
            listing["seller_id"] = str(listing["seller_id"])

    content = api_response(
        True,
        f"Found {len(results)} listings matching '{q}'",
        results
    )
    return JSONResponse(content.to_dict())


@properties.get("/{property_id}", summary="Get property by id")
async def get_property(property_id: str):
    """Return a minimal property detail placeholder."""
    return {
        "status": True,
        "message": "Property detail (placeholder)",
        "payload": {"id": property_id},
        "meta": {},
    }
