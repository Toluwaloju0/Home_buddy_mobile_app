from pydantic import BaseModel

class InspectionModel(BaseModel):
    property_id: str
    requester_id: str
    preferred_time: str | None = None
    status: str | None = "requested"
