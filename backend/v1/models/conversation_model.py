"""Conversation schema for buyer-seller message threads."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class Conversation(BaseModel):
    """Conversation document containing the buyer and seller pair."""

    seller_id: Any
    buyer_id: Any
    created_at: datetime = Field(default_factory=datetime.now)
