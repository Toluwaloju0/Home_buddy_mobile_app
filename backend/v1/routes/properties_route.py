from fastapi import APIRouter, Depends, Query, Body
from fastapi.responses import JSONResponse
from typing import List

from database.db_engine import storage
from middlewares.verify_user import get_user_from_token
from utils.responses import api_response
from utils.create_filter import get_price_value
from utils.state_list import *

properties = APIRouter(prefix="/properties", tags=["properties"])

@properties.post("/browse", summary="Browse listings by location")
async def browse_listings(
    location: str | None = Query(None, min_length=1),
    page: int = Query(1, ge=1),
    to_buy: bool = Body(None),
    property_type: str | None = Body(None),
    min_price: int | None = Body(None),
    max_price: int | None = Body(None),
    user_response = Depends(get_user_from_token)
):
    """Return paginated listings that match the provided location string.

    This endpoint is intentionally public so landing-page visitors can discover
    listings without authenticating. Listing details remain protected.

    if an authenticated user is using the endpoint dont display house information for that user
    """

    # create the filter and use it to query the database
    if user_response.status and not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)
    user_id, filter = user_response.payload.get("_id") if user_response.status and user_response.payload else None, {}

    # check for the location among states or local government area
    if location:
        if location.lower() in States_list:
            filter["state"] = location   # use a regex here
        else:
            for value in States_with_lgas.values():
                print(value)
                if location in value:
                    filter["LGA"] = location.title()   # use a regex here also
                    break
            else:
                content = api_response(False, "The location given is not for any state or local government area in nigeria")
                return JSONResponse(content.to_dict(), 400)

    if user_id:
        # the listings gotten should not include listings for the seller if the user is a seller
        if user_response.payload.get("role") in ["both", "seller"]:
            seller_response = await storage.get_seller_by_user_id(user_id)
            if seller_response.status:
                filter["seller_id"] = {"$ne": seller_response.payload.get("_id")}
    if to_buy: filter["for_sell"] = True
    if property_type: filter["property_type"] = property_type
    if min_price and max_price: filter["price"] = get_price_value(min_price, max_price)

    db_response = await storage.get_listings_by_location(page, filter)
    if not db_response.status:
        content = api_response(False, "Failed to fetch listings")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, f"Listings search completed", db_response.payload)
    return JSONResponse(content.to_dict())


@properties.get("/rentals", summary="Browse rental listings")
async def browse_rentals(page: int = Query(1, ge=1)):
    """Return paginated rental listings (not sold)."""
    per_page = 10
    db_response = await storage.get_rental_listings(page, per_page)
    if not db_response.status:
        content = api_response(False, "Failed to fetch rental listings")
        return JSONResponse(content.to_dict(), 500)

    payload = db_response.payload or {}
    results = payload.get("results", [])
    total = int(payload.get("total", 0))

    # Convert ObjectIds to strings for JSON serialization
    for listing in results:
        if isinstance(listing, dict) and listing.get("_id"):
            listing["_id"] = str(listing["_id"])
        if isinstance(listing, dict) and listing.get("seller_id"):
            try:
                listing["seller_id"] = str(listing["seller_id"])
            except Exception:
                pass

    meta = {"page": int(page), "per_page": per_page, "total": total}
    content = api_response(True, "Rental listings", {"listings": results, "meta": meta})
    return JSONResponse(content.to_dict())

@properties.get("/{property_id}", summary="Get property by id")
async def get_property(property_id: str, user_response=Depends(get_user_from_token)):
    """Return the property detail but require a valid access token.

    Listing detail access requires authentication; callers without a
    valid access token will receive a non-success response.
    """

    # Verify user authentication
    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    listing_resp = await storage.get_listing_by_id(property_id)
    if not listing_resp.status or not listing_resp.payload:
        content = api_response(False, "Listing not found")
        return JSONResponse(content.to_dict(), 404)

    content = api_response(True, "Listing retrieved", listing_resp.payload)
    return JSONResponse(content.to_dict())
