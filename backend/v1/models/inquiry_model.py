from pydantic import BaseModel

class InquiryModel(BaseModel):
    property_id: str
    buyer_id: str
    message: str
    status: str | None = "open"
