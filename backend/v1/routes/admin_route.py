from fastapi import APIRouter, Depends
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


@admin.get("/dashboard", summary="Admin dashboard")
@admin.get("/dashboard/stats", summary="Admin dashboard stats")
async def admin_dashboard(user_response=Depends(get_admin_from_token)):
    if not user_response.status:
        print(user_response.status)
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    user = user_response.payload
    if not _is_admin(user):
        content = api_response(False, "Unauthorized: admin access required")
        return JSONResponse(content.to_dict(), 401)

    stats_response = await storage.get_admin_dashboard_stats()
    if not stats_response.status:
        content = api_response(False, "Failed to retrieve admin dashboard stats")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Admin dashboard stats retrieved successfully", stats_response.payload)
    return JSONResponse(content.to_dict())


@admin.get("/kyc/pending", summary="Pending KYC queue")
async def admin_kyc_pending(user_response=Depends(get_admin_from_token)):
    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    content = api_response(True, "Pending KYC (placeholder)", [])
    return JSONResponse(content.to_dict())
