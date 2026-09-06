"""Seller-specific database services."""

from typing import Any

from bson import ObjectId
from pymongo import AsyncMongoClient

from services.s3_uploader import uploader
from models.responses import serialize_mongo_value
from utils.settings import settings


class SellerService:
    """Database operations used by seller-facing routes."""

    def __init__(self):
        self._mongo_uri = settings.mongo_uri

    async def get_buyer_information(self, buyer_id: str) -> dict[str, Any] | None:
        """Return buyer name and image URL through the buyer's user_id link."""
        if not ObjectId.is_valid(buyer_id):
            return None

        client = AsyncMongoClient(self._mongo_uri)
        try:
            database = client.get_database("Home_Buddy")
            buyer = await database["buyers"].find_one(
                {"_id": ObjectId(buyer_id)},
                {"user_id": 1},
            )
            if not buyer or not buyer.get("user_id"):
                return None

            user = await database["users"].find_one(
                {"_id": buyer["user_id"]},
                {"first_name": 1, "last_name": 1, "email": 1, "image_key": 1},
            )
            if not user:
                return None

            name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
            return {
                "name": name or user.get("email", "Buyer"),
                "image_url": uploader.create_url(user.get("image_key")),
            }
        finally:
            await client.close()

    async def get_seller_conversations(self, seller_id: str, page: int = 1) -> list[dict[str, Any]]:
        """Return ten seller conversations per page, newest conversations first."""
        if not ObjectId.is_valid(seller_id):
            return []

        client = AsyncMongoClient(self._mongo_uri)
        try:
            database = client.get_database("Home_Buddy")
            conversations = await database["conversation"].find(
                {"seller_id": ObjectId(seller_id)}
            ).sort("created_at", -1).skip((page - 1) * 10).limit(10).to_list(length=10)
            return [serialize_mongo_value(item) for item in conversations]
        finally:
            await client.close()
