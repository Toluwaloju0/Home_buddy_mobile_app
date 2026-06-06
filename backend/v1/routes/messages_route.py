"""Module for handling buyer-seller messaging between listings."""

from datetime import datetime
from bson import ObjectId
from fastapi import APIRouter, Depends, Form
from fastapi.responses import JSONResponse

from database.db_engine import storage
from middlewares.verify_user import get_user_from_token
from utils.responses import api_response


async def serialize_mongo_value(value):
    """Convert Mongo-specific values into JSON-safe primitives."""
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: await serialize_mongo_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [await serialize_mongo_value(item) for item in value]
    return value


messages = APIRouter(prefix="/messages", tags=["Messages"], dependencies=[Depends(get_user_from_token)])


@messages.post("/send")
async def send_message(
    receiver_id: str = Form(...),
    listing_id: str = Form(...),
    message_text: str = Form(...),
    listing_title: str = Form(None),
    user_response=Depends(get_user_from_token),
):
    """Send a message from an authenticated user to another user about a listing."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    sender_id = str(user.get("_id"))
    sender_name = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or user.get("email", "User")

    if not receiver_id or not message_text.strip():
        content = api_response(False, "receiver_id and message_text are required")
        return JSONResponse(content.to_dict(), 400)

    # Preserve the authenticated user's actual role for future buyer/seller flows.
    sender_role = user.get("role", "seller")

    message_data = {
        "sender_id": sender_id,
        "sender_name": sender_name,
        "sender_role": sender_role,
        "receiver_id": receiver_id,
        "listing_id": listing_id,
        "listing_title": listing_title or "Property",
        "message_text": message_text.strip(),
        "created_at": datetime.now(),
        "read": False,
    }

    save_response = await storage.save_message(message_data)
    if not save_response.status:
        content = api_response(False, "Failed to send message")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Message sent successfully", save_response.payload)
    return JSONResponse(content.to_dict())


@messages.get("/")
async def get_conversations(user_response=Depends(get_user_from_token)):
    """Get all conversations for the authenticated user (seller or buyer)."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    user_id = str(user.get("_id"))

    # Get conversations where user is a seller (receiver)
    seller_conversations_response = await storage.get_seller_conversations(user_id)
    if not seller_conversations_response.status:
        content = api_response(False, "Failed to retrieve conversations")
        return JSONResponse(content.to_dict(), 500)

    conversations = seller_conversations_response.payload
    serialized_conversations = [await serialize_mongo_value(conv) for conv in conversations]

    content = api_response(True, "Conversations retrieved successfully", serialized_conversations)
    return JSONResponse(content.to_dict())


@messages.get("/buyer")
async def get_buyer_conversations(user_response=Depends(get_user_from_token)):
    """Get all conversations for the authenticated buyer."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    user_id = str(user.get("_id"))

    buyer_conversations_response = await storage.get_buyer_conversations(user_id)
    if not buyer_conversations_response.status:
        content = api_response(False, "Failed to retrieve conversations")
        return JSONResponse(content.to_dict(), 500)

    conversations = buyer_conversations_response.payload
    serialized_conversations = [await serialize_mongo_value(conv) for conv in conversations]

    content = api_response(True, "Buyer conversations retrieved successfully", serialized_conversations)
    return JSONResponse(content.to_dict())


@messages.get("/{buyer_id}/{listing_id}")
async def get_conversation_thread(
    buyer_id: str,
    listing_id: str,
    user_response=Depends(get_user_from_token),
):
    """Get all messages in a conversation between a seller and a buyer for a specific listing."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    seller_id = str(user.get("_id"))

    messages_response = await storage.get_conversation_messages(seller_id, buyer_id, listing_id)
    if not messages_response.status:
        content = api_response(False, "Failed to retrieve conversation messages")
        return JSONResponse(content.to_dict(), 500)

    conversation_messages = messages_response.payload
    serialized_messages = [await serialize_mongo_value(msg) for msg in conversation_messages]

    content = api_response(True, "Conversation retrieved successfully", serialized_messages)
    return JSONResponse(content.to_dict())


@messages.get("/unread/count")
async def get_unread_count(user_response=Depends(get_user_from_token)):
    """Get the count of unread messages for the authenticated user."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    user_id = str(user.get("_id"))

    count_response = await storage.get_unread_message_count(user_id)
    if not count_response.status:
        content = api_response(False, "Failed to retrieve unread count")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Unread count retrieved", count_response.payload)
    return JSONResponse(content.to_dict())


@messages.put("/{buyer_id}/read")
async def mark_conversation_as_read(
    buyer_id: str,
    listing_id: str = Form(None),
    user_response=Depends(get_user_from_token),
):
    """Mark all messages from a specific buyer as read."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    seller_id = str(user.get("_id"))

    mark_response = await storage.mark_messages_as_read(seller_id, buyer_id, listing_id)
    if not mark_response.status:
        content = api_response(False, "Failed to mark messages as read")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Messages marked as read", mark_response.payload)
    return JSONResponse(content.to_dict())
