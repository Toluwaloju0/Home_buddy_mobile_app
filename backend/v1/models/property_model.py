from pydantic import BaseModel
from typing import List

class ImageMetadata(BaseModel):
    """Metadata for an individual image including type and order."""
    filename: str
    content_type: str
    url: str
    key: str
    image_type: str  # e.g., "Bathroom", "Bedroom", "Kitchen", "Exterior"
    image_number: int  # e.g., 1, 2, 3 for "Bathroom Image 1", "Bathroom Image 2"

class PropertySchema(BaseModel):
    title: str
    description: str | None = None
    rent: float | None = None
    currency: str = "NGN"
    address: str | None = None
    amenities: List[str] | None = []
    images: List[str] | None = []
    status: str | None = "draft"

class ListingSchema(BaseModel):
    """Schema for a complete listing with media and property details."""
    submission_id: str
    seller_id: str
    title: str
    category: str
    price: str
    location: str | None = None
    description: str | None = None
    year_built: str | None = None
    property_type: str | None = None
    number_of_bedrooms: str | None = None
    number_of_bathrooms: str | None = None
    size_square_meters: str | None = None
    full_address: str | None = None
    listing_plan: str | None = None
    media: dict  # Contains grouped media with metadata
    status: str = "pending_approval"
    is_negotiable: bool = True
    created_at: str | None = None
    updated_at: str | None = None
