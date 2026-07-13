from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from database.db_engine import storage
from middlewares.verify_user import get_admin_from_token
from models.user import UserRole
from utils.responses import api_response

admin = APIRouter(prefix="/admin", tags=["admin"])

def _admin_access_error(user_response):
    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    if user_response.payload.get("role") != UserRole.ADMIN:
        content = api_response(False, "Unauthorized: admin access required")
        return JSONResponse(content.to_dict(), 401)

    return None

@admin.get("/dashboard/stats", summary="Admin dashboard stats")
async def admin_dashboard(user_response=Depends(get_admin_from_token)):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error

    stats_response = await storage.get_admin_dashboard_stats()
    if not stats_response.status:
        content = api_response(False, "Failed to retrieve admin dashboard stats")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Admin dashboard stats retrieved successfully", stats_response.payload)
    return JSONResponse(content.to_dict())


@admin.get("/users", summary="Paginated users list")
@admin.get("/users/{user_id}", summary="Paginated unverified users list if user_id is unverified else a user object")
async def admin_users(
    user_id:str | None = None,
    page: int = 1,
    user_response=Depends(get_admin_from_token),
):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error
    
    if not user_id:
        users_response = await storage.get_admin_users(page)
        if not users_response.status:
            content = api_response(False, "Failed to retrieve users")
            return JSONResponse(content.to_dict(), 500)
        
        content = api_response(True, "Users retrieved successfully", users_response.payload)
        return JSONResponse(content.to_dict())

    # handle unverified users
    elif user_id == "unverified":
        user_response = await storage.get_admin_users(page, {"is_verified": False})
        if not user_response.status:
            content = api_response(False, "Failed to retrieve unverified users")
            return JSONResponse(content.to_dict(), 500)
        
        payload = user_response.payload or []
        
        content = api_response(True, "Unverified Users retrieved successfully", payload)
        return JSONResponse(content.to_dict())
    
    # handle sellers
    elif user_id == "sellers":
        user_response = await storage.get_admin_users(page, {"role": {"$in": ["sellers", "both"]}})
        if not user_response.status:
            content = api_response(False, "Failed to retrieve sellers")
            return JSONResponse(content.to_dict(), 500)
        
        payload = user_response.payload or []
        
        content = api_response(True, "Sellers retrieved successfully", payload)
        return JSONResponse(content.to_dict())

    # handle buyers
    elif user_id == "buyers":
        user_response = await storage.get_admin_users(page, {"role": {"$in": ["buyers", "both"]}})
        if not user_response.status:
            content = api_response(False, "Failed to retrieve buyers")
            return JSONResponse(content.to_dict(), 500)
        
        payload = user_response.payload or []
        
        content = api_response(True, "Buyers retrieved successfully", payload)
        return JSONResponse(content.to_dict())

    else:
        user_response = await storage.get_admin_user_by_id(user_id)
        content = api_response(True, "The user is retrieved successfully", user_response.payload) if user_response.status else api_response(False, "The user is not retrieved")
        return JSONResponse(content.to_dict())


@admin.get("/properties/pending", summary="Paginated pending property listings")
async def admin_pending_properties(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_response=Depends(get_admin_from_token),
):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error

    listings_response = await storage.get_admin_pending_listings(page, per_page)
    if not listings_response.status:
        content = api_response(False, "Failed to retrieve pending properties")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Pending properties retrieved successfully", listings_response.payload)
    return JSONResponse(content.to_dict())


@admin.post("/properties/{property_id}/approve", summary="Approve property listing")
async def admin_approve_property(property_id: str, user_response=Depends(get_admin_from_token)):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error

    listing_response = await storage.update_admin_listing_status(
        property_id,
        "approved",
        str(user_response.payload.get("_id")),
    )
    if not listing_response.status:
        content = api_response(False, "Failed to approve property listing")
        return JSONResponse(content.to_dict(), 400)

    content = api_response(True, "Property listing approved successfully", listing_response.payload)
    return JSONResponse(content.to_dict())


@admin.post("/properties/{property_id}/decline", summary="Decline property listing")
async def admin_decline_property(property_id: str, user_response=Depends(get_admin_from_token)):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error

    listing_response = await storage.update_admin_listing_status(
        property_id,
        "declined",
        str(user_response.payload.get("_id")),
    )
    if not listing_response.status:
        content = api_response(False, "Failed to decline property listing")
        return JSONResponse(content.to_dict(), 400)

    content = api_response(True, "Property listing declined successfully", listing_response.payload)
    return JSONResponse(content.to_dict())


@admin.get("/properties/{property_id}", summary="Admin property detail")
async def admin_property_detail(property_id: str, user_response=Depends(get_admin_from_token)):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error

    listing_response = await storage.get_admin_listing_by_id(property_id)
    if not listing_response.status:
        content = api_response(False, "Property listing not found")
        return JSONResponse(content.to_dict(), 404)

    content = api_response(True, "Property listing retrieved successfully", listing_response.payload)
    return JSONResponse(content.to_dict())


@admin.get("/kyc/pending", summary="Pending KYC queue")
async def admin_kyc_pending(user_response=Depends(get_admin_from_token)):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error

    content = api_response(True, "Pending KYC (placeholder)", [])
    return JSONResponse(content.to_dict())
