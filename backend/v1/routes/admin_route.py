from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from database.db_engine import storage
from middlewares.verify_user import get_admin_from_token
from models.user import UserRole
from utils.responses import api_response

admin = APIRouter(prefix="/admin", tags=["admin"])


def _is_admin(user: dict | None) -> bool:
    if not user:
        return False

    role = user.get("role")
    print(role, "role")
    role_value = role.value if hasattr(role, "value") else str(role)
    return role_value.lower() == UserRole.ADMIN.value


def _admin_access_error(user_response):
    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    if not _is_admin(user_response.payload):
        content = api_response(False, "Unauthorized: admin access required")
        return JSONResponse(content.to_dict(), 401)

    return None


@admin.get("/dashboard", summary="Admin dashboard")
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
async def admin_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_response=Depends(get_admin_from_token),
):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error

    users_response = await storage.get_admin_users(page, per_page)
    if not users_response.status:
        content = api_response(False, "Failed to retrieve users")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Users retrieved successfully", users_response.payload)
    return JSONResponse(content.to_dict())


@admin.get("/users/unverified", summary="Paginated unverified users list")
async def admin_unverified_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user_response=Depends(get_admin_from_token),
):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error

    users_response = await storage.get_admin_unverified_users(page, per_page)
    if not users_response.status:
        content = api_response(False, "Failed to retrieve unverified users")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Unverified users retrieved successfully", users_response.payload)
    return JSONResponse(content.to_dict())


@admin.get("/users/{user_id}", summary="Admin user detail")
async def admin_user_detail(user_id: str, user_response=Depends(get_admin_from_token)):
    access_error = _admin_access_error(user_response)
    if access_error:
        return access_error

    user_detail_response = await storage.get_admin_user_by_id(user_id)
    if not user_detail_response.status:
        content = api_response(False, "User not found")
        return JSONResponse(content.to_dict(), 404)

    content = api_response(True, "User retrieved successfully", user_detail_response.payload)
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
