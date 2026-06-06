from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from database.db_engine import storage
from middlewares.verify_user import get_user_from_token
from utils.responses import api_response


inspections = APIRouter(prefix="/inspections", tags=["inspections"])


class InspectionRequest(BaseModel):
    property_id: str
    requester_id: str
    preferred_time: str | None = None


@inspections.post("/request", summary="Request inspection")
async def request_inspection(req: InspectionRequest):
    return {"status": True, "message": "Inspection requested (placeholder)", "payload": req.dict()}


@inspections.get("/my-requests", summary="Get my inspection requests")
async def my_inspection_requests(user_response=Depends(get_user_from_token)):
    """Return inspection requests made by the authenticated buyer."""
    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    user_id = str(user.get("_id"))

    db_resp = await storage.get_inspections_by_requester(user_id)
    if not db_resp.status:
        content = api_response(False, "Failed to retrieve inspection requests")
        return JSONResponse(content.to_dict(), 500)

    results = db_resp.payload or []
    # normalize ObjectId to strings if present and enrich with property title when possible
    for item in results:
        if isinstance(item, dict) and item.get("_id"):
            item["_id"] = str(item["_id"])
        prop_id = item.get("property_id")
        if prop_id:
            listing_resp = await storage.get_listing_by_id(prop_id)
            if listing_resp.status and listing_resp.payload:
                item["property"] = listing_resp.payload.get("title") or prop_id
            else:
                item["property"] = prop_id

    content = api_response(True, "Inspection requests retrieved", results)
    return JSONResponse(content.to_dict())
