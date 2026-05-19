from fastapi import APIRouter
from pydantic import BaseModel

escrow = APIRouter(prefix="/escrow", tags=["escrow"])


class EscrowCreate(BaseModel):
    property_id: str
    amount: float
    payer_id: str
    payee_id: str


@escrow.post("/transactions", summary="Create escrow transaction")
async def create_escrow(tx: EscrowCreate):
    return {"status": True, "message": "Escrow created (placeholder)", "payload": tx.dict()}
