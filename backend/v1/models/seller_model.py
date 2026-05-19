"""Seller profile model for seller-specific KYC and business details."""

from models.base_model import Basemodel


class Seller(Basemodel):
    """Seller profile document linked to a user record."""

    user_id: str | None = None
    date_of_birth: str | None = None
    gender: str | None = None
    residential_address: str | None = None
    about_me: str | None = None
    business_type: str | None = None
    business_address: str | None = None
    years_of_experience: str | None = None
    company_name: str | None = None
    cac_registration_number: str | None = None
    company_website: str | None = None
    proof_of_address_url: str | None = None
    national_id_type: str | None = None
    id_number: str | None = None
    id_front_url: str | None = None
    id_back_url: str | None = None
    account_name: str | None = None
    bank_name: str | None = None
    account_number: str | None = None
    profile_image_url: str | None = None
    status: str = "draft"
    is_verified: bool = False

    def __init__(self, **kwargs):
        super().__init__()
        for key, value in kwargs.items():
            setattr(self, key, value)
