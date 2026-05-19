from pydantic import BaseModel

class EscrowModel(BaseModel):
    property_id: str
    amount: float
    payer_id: str
    payee_id: str
    status: str | None = "initiated"
