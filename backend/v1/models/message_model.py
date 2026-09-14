"""Message schema for buyer-seller communications."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class MessageSchema(BaseModel):
    """Schema for a single message."""

    sender_id: str
    message_text: str
    conversation_id: str | None = None
    read: bool = False
    listing_id: Optional[str] = None
    message_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
