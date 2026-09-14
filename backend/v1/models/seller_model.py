"""Seller profile model for seller-specific KYC details."""

from pydantic import BaseModel


class Seller(BaseModel):
    """Seller profile document linked to a user record."""

    about_me: str | None = None
    id_type: str
    id_number: str | None
