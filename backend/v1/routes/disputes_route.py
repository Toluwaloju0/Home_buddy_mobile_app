from fastapi import APIRouter
from pydantic import BaseModel

disputes = APIRouter(prefix="/disputes", tags=["disputes"])


class DisputeCreate(BaseModel):
    transaction_id: str
    reason: str
    raised_by: str


@disputes.post("/", summary="Open a dispute")
async def open_dispute(d: DisputeCreate):
    return {"status": True, "message": "Dispute opened (placeholder)", "payload": d.dict()}


@disputes.get("/", summary="List disputes")
async def list_disputes():
    return {"status": True, "message": "Disputes list (placeholder)", "payload": []}
