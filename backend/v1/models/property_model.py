""" a module to create the different listing schemas"""

import enum
from typing import Any
from pydantic import BaseModel
from typing import List,  Dict

class ListingType(str, enum.Enum):
    SHOP = "shop"
    LAND = "land"
    APARTMENT = "apartment"

class ShopListingSchema(BaseModel):
    """Schema for a complete listing with media and property details."""
    seller_id: Any
    title: str
    price: int
    state: str
    LGA: str
    street: str
    building_number: int
    shop_number: int
    inspection_means: str
    property_type: ListingType = ListingType.SHOP
    description: str | None = None
    size_square_meters: str | None = None
    listing_media: List[Dict[str, str | Dict]] = []
    verification_media: List[Dict[str, str | Dict]] = []
    status: str = "pending_approval"
    is_negotiable: bool = True
    bathroom: bool = True


class LandListingSchema(BaseModel):
    """Schema for a complete listing with media and property details."""
    seller_id: Any
    title: str
    price: int
    state: str
    LGA: str
    street: str
    building_number: int
    inspection_means: str
    property_type: ListingType = ListingType.LAND
    description: str | None = None
    size_square_meters: str | None = None
    listing_media: List[Dict[str, str | Dict]] = []
    verification_media: List[Dict[str, str | Dict]] = []
    status: str = "pending_approval"
    is_negotiable: bool = True


class ApartmentListingSchema(BaseModel):
    """Schema for a complete listing with media and property details."""
    seller_id: Any
    title: str
    price: int
    state: str
    LGA: str
    street: str
    building_number: int
    house_number: int | None = None
    inspection_means: str
    description: str | None = None
    year_built: int | None = None
    property_type: str | None = None
    number_of_bedrooms: int | None = None
    number_of_bathrooms: int | None = None
    size_square_meters: int | None = None
    other_amenities: List[str]
    listing_media: List[Dict[str, str] | Dict] = [] # Contains grouped media with metadata
    verification_media: List[Dict[str, str] | Dict] = []
    status: str = "pending_approval"
    is_negotiable: bool = True