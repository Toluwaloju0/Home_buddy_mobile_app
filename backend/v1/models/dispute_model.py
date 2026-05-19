from pydantic import BaseModel

class DisputeModel(BaseModel):
    transaction_id: str
    reason: str
    raised_by: str
    status: str | None = "open"
