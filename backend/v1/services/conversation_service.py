"""Database access for buyer-seller conversations."""

from typing import Any
from bson import ObjectId
from pymongo import AsyncMongoClient

from models.conversation_model import Conversation
from models.responses import serialize_mongo_value
from utils.settings import settings


class ConversationService:
    """Retrieve conversation messages with a short-lived MongoDB client."""

    PAGE_SIZE = 20

    def __init__(self):
        self._mongo_uri = settings.mongo_uri

    @staticmethod
    def _object_id(value: str | ObjectId, field_name: str) -> ObjectId:
        """Convert an ID to ObjectId and reject values that cannot be persisted."""
        if isinstance(value, ObjectId):
            return value
        if not value or not ObjectId.is_valid(value):
            raise ValueError(f"{field_name} must be a valid ObjectId")
        return ObjectId(value)

    async def create_conversation(self, buyer_id: str, seller_id: str) -> str:
        """Create a model-shaped conversation and return its Mongo ID."""
        buyer_object_id = self._object_id(buyer_id, "buyer_id")
        seller_object_id = self._object_id(seller_id, "seller_id")
        client = AsyncMongoClient(self._mongo_uri)
        try:
            database = client.get_database("Home_Buddy")
            existing = await database["conversation"].find_one(
                {"buyer_id": buyer_object_id, "seller_id": seller_object_id},
                {"_id": 1},
            )
            if existing:
                return str(existing["_id"])

            conversation = Conversation(buyer_id=buyer_object_id, seller_id=seller_object_id)
            result = await database["conversation"].insert_one(conversation.model_dump())
            return str(result.inserted_id)
        finally:
            await client.close()

    async def save_message(
        self,
        message: Any,
        buyer_id: str | None = None,
        seller_id: str | None = None,
    ) -> dict[str, Any]:
        """Create a conversation ID when needed and save a model-shaped message."""
        client = AsyncMongoClient(self._mongo_uri)
        try:
            database = client.get_database("Home_Buddy")
            conversation_id = message.conversation_id
            if not conversation_id and buyer_id and seller_id:
                conversation_id = await self.create_conversation(buyer_id, seller_id)
            if not conversation_id:
                raise ValueError("conversation_id is required")

            message_data = message.model_dump(exclude_none=True)
            message_data["sender_id"] = self._object_id(message_data["sender_id"], "sender_id")
            message_data["conversation_id"] = self._object_id(conversation_id, "conversation_id")
            if message_data.get("listing_id") is not None:
                message_data["listing_id"] = self._object_id(message_data["listing_id"], "listing_id")
            if message_data.get("message_id") is not None:
                message_data["message_id"] = self._object_id(message_data["message_id"], "message_id")
            message_data.setdefault("read", False)
            result = await database["messages"].insert_one(message_data)
            message_data["message_id"] = str(result.inserted_id)
            return serialize_mongo_value(message_data)
        finally:
            await client.close()

    async def get_messages(
        self,
        buyer_id: str,
        seller_id: str,
        page: int = 1,
    ) -> list[dict[str, Any]]:
        buyer_object_id = self._object_id(buyer_id, "buyer_id")
        seller_object_id = self._object_id(seller_id, "seller_id")
        client = AsyncMongoClient(self._mongo_uri)
        try:
            database = client.get_database("Home_Buddy")
            conversation = await database["conversation"].find_one(
                {"buyer_id": buyer_object_id, "seller_id": seller_object_id},
                {"conversation_id": 1},
            )
            if not conversation:
                return []

            conversation_id = conversation.get("_id")
            if conversation_id is None:
                return []

            messages = await database["messages"].find(
                {
                    "conversation_id": {
                        "$in": [self._object_id(conversation_id, "conversation_id")]
                    }
                }
            ).sort("created_at", -1).skip((page - 1) * self.PAGE_SIZE).limit(self.PAGE_SIZE).to_list(length=self.PAGE_SIZE)
            return [serialize_mongo_value(message) for message in reversed(messages)]
        finally:
            await client.close()

    async def get_message(self, message_id: str) -> dict[str, Any] | None:
        """Retrieve one message by its Mongo ObjectId."""
        client = AsyncMongoClient(self._mongo_uri)
        try:
            database = client.get_database("Home_Buddy")
            message = await database["messages"].find_one(
                {"_id": self._object_id(message_id, "message_id")}
            )
            return serialize_mongo_value(message) if message else None
        finally:
            await client.close()

