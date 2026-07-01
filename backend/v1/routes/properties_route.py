from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.encoders import jsonable_encoder
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
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

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


@properties.get("/browse", summary="Browse listings by location")
async def browse_listings(location: str = Query(..., min_length=1), page: int = Query(1, ge=1)):
    """Return paginated listings that match the provided location string.

    This endpoint is intentionally public so landing-page visitors can discover
    listings without authenticating. Listing details remain protected.
    """
    per_page = 10
    db_response = await storage.get_listings_by_location(location, page, per_page)
    if not db_response.status:
        content = api_response(False, "Failed to fetch listings")
        return JSONResponse(content.to_dict(), 500)

    payload = db_response.payload or {}
    results = payload.get("results", [])
    total = int(payload.get("total", 0))

    # Convert ObjectIds to strings for JSON serialization
    for listing in results:
        if isinstance(listing, dict) and listing.get("_id"):
            listing["_id"] = str(listing["_id"])

    meta = {"page": int(page), "per_page": per_page, "total": total}
    content = api_response(True, f"Listings for '{location}'", {"listings": results, "meta": meta})
    print(results)
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

@properties.get("/recommended", summary="Recommended listings")
async def recommended_listings(user_response=Depends(get_user_from_token), page: int = 1, per_page: int = 6):
    """Return a paginated list of recommended/latest listings."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)
    
    # get the database response for all the listings present for this page

    db_response = await storage.get_recommended_listings(user_response.payload.get("_id"), page, per_page)
    if not db_response.status:
        content = api_response(False, "Failed to fetch recommended listings")
        return JSONResponse(content.to_dict(), 500)

    payload = db_response.payload or {}
    results = payload.get("results", [])
    total = payload.get("total", len(results))

    # print(results, "=" * 80)

    for listing in results:
        if isinstance(listing, dict) and listing.get("_id"):
            listing["_id"] = str(listing["_id"])
        if isinstance(listing, dict) and listing.get("seller_id"):
            try:
                listing["seller_id"] = str(listing["seller_id"])
            except Exception:
                pass

    meta = {"page": int(page), "per_page": int(per_page), "total": total}
    content = api_response(True, "Got Recommended listings", {"listings": results, "meta": meta})
    return JSONResponse(jsonable_encoder(content.to_dict()))

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

    listing = listing_resp.payload
    if listing.get("_id"):
        listing["_id"] = str(listing["_id"])
    if listing.get("seller_id"):
        del listing["seller_id"]
    if listing.get("updated_at"):
        listing["updated_at"] = listing["updated_at"].isoformat()
    if listing.get("created_at"):
        listing["created_at"] = listing["created_at"].isoformat()
    if listing.get("reviewed_at"):
        del listing["reviewed_at"]
    if listing.get("reviewed_by"):
        del listing["reviewed_by"]

    content = api_response(True, "Listing retrieved", listing)
    return JSONResponse(content.to_dict())
