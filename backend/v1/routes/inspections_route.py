from fastapi import APIRouter
from pydantic import BaseModel

inspections = APIRouter(prefix="/inspections", tags=["inspections"])


class InspectionRequest(BaseModel):
    property_id: str
    requester_id: str
    preferred_time: str | None = None


@inspections.post("/request", summary="Request inspection")
async def request_inspection(req: InspectionRequest):
    return {"status": True, "message": "Inspection requested (placeholder)", "payload": req.dict()}
