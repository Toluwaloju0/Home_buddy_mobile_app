"""Message model for buyer-seller communications."""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageSchema(BaseModel):
    """Schema for a single message."""
    sender_id: str
    sender_name: Optional[str] = None
    sender_role: str  # "buyer" or "seller"
    receiver_id: str
    listing_id: Optional[str] = None
    listing_title: Optional[str] = None
    message_text: str
    created_at: Optional[datetime] = None
    read: bool = False


class ConversationSchema(BaseModel):
    """Schema for a conversation thread between two users."""
    seller_id: str
    buyer_id: str
    listing_id: str
    listing_title: str
    last_message: str
    last_message_at: datetime
    unread_count: int = 0
    buyer_name: Optional[str] = None
    seller_name: Optional[str] = None


class MessageOfferSchema(BaseModel):
    """Schema for an offer within a message."""
    sender_id: str
    property_title: str
    property_location: str
    offered_price: float
    offer_date: Optional[datetime] = None
    status: str = "new"  # new, accepted, rejected, negotiating
