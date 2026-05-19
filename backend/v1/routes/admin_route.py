from fastapi import APIRouter

admin = APIRouter(prefix="/admin", tags=["admin"])


@admin.get("/dashboard", summary="Admin dashboard")
async def admin_dashboard():
    return {"status": True, "message": "Admin dashboard (placeholder)", "payload": {}}


@admin.get("/kyc/pending", summary="Pending KYC queue")
async def admin_kyc_pending():
    return {"status": True, "message": "Pending KYC (placeholder)", "payload": []}
