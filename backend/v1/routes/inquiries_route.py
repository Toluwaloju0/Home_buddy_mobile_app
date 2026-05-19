from fastapi import APIRouter
from pydantic import BaseModel

inquiries = APIRouter(prefix="/inquiries", tags=["inquiries"])


class InquiryCreate(BaseModel):
    property_id: str
    buyer_id: str
    message: str


@inquiries.post("/", summary="Create inquiry for property")
async def create_inquiry(i: InquiryCreate):
    return {"status": True, "message": "Inquiry created (placeholder)", "payload": i.dict()}
