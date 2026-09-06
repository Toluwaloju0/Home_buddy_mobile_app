"""Module for handling buyer-seller messaging between listings."""

import asyncio
import json

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse

from models.message_model import MessageSchema
from middlewares.verify_user import get_user_from_token
from services.conversation_service import ConversationService
from utils.cookie_token import token_manager
from utils.responses import api_response

messages = APIRouter(tags=["Messages"])


@messages.get("/message/{message_id}/text", summary="Get a referenced message")
async def get_message_text(
	message_id: str,
	user_response=Depends(get_user_from_token),
):
	"""Return the message referenced by a tagged message ID."""
	if not user_response.status:
		return JSONResponse(api_response(False, "The access token provided is not valid").to_dict(), 401)
	if not user_response.payload:
		return JSONResponse(api_response(False, "The access token is expired, refresh and try again").to_dict(), 205)

	message = await ConversationService().get_message(message_id)
	if not message:
		return JSONResponse(api_response(False, "Message not found").to_dict(), 404)
	return JSONResponse(api_response(True, "Message retrieved successfully", message).to_dict())


@messages.post("/messages/conversation", summary="Create a conversation")
async def create_conversation(
	buyer_id: str = Query(..., min_length=1),
	seller_id: str = Query(..., min_length=1),
	user_response=Depends(get_user_from_token),
):
	"""Create or return the conversation ID for a buyer and seller pair."""

	if not user_response.status:
		content = api_response(False, "The access token provided is not valid")
		return JSONResponse(content.to_dict(), 401)

	if not user_response.payload:
		content = api_response(False, "The access token is expired, refresh and try again")
		return JSONResponse(content.to_dict(), 205)


	conversation_id = await ConversationService().create_conversation(buyer_id, seller_id)
	content = api_response(True, "Conversation created successfully", {"conversation_id": conversation_id})
	return JSONResponse(content.to_dict())

@messages.websocket("/messages/{conversation_id}/ws")
async def send_message_websocket(websocket: WebSocket, conversation_id: str):
	"""Accept messages until five minutes pass without another message."""
	access_token = websocket.cookies.get("access_token")
	user_response = await token_manager.verify_access_token(access_token)
	if not user_response.status:
		await websocket.close(code=4001)
		return
	if not user_response.payload:
		await websocket.close(code=4005)
		return

	await websocket.accept()
	service = ConversationService()
	sender_id = str(user_response.payload.get("_id"))
	if not sender_id:
		await websocket.close(code=4003)
		return
	try:
		while True:
			try:
				raw_message = await asyncio.wait_for(websocket.receive_text(), timeout=300)
			except asyncio.TimeoutError:
				await websocket.close(code=1000)
				return

			try:
				message_data = json.loads(raw_message)
				if not isinstance(message_data, dict):
					raise ValueError("message body must be an object")
				message_data["sender_id"] = sender_id
				message_data["conversation_id"] = conversation_id
				message = MessageSchema.model_validate(message_data)
			except (json.JSONDecodeError, ValueError, TypeError):
				await websocket.send_json({"status": False, "message": "message_text is required"})
				continue

			message.sender_id = sender_id
			message.conversation_id = conversation_id
			if not message.message_text.strip():
				await websocket.send_json({"status": False, "message": "message_text is required"})
				continue

			saved_message = await service.save_message(message)
			await websocket.send_json(api_response(True, "Message sent successfully", saved_message).to_dict())
	except WebSocketDisconnect:
		return


@messages.get("/conversation", summary="Get a buyer-seller conversation")
async def get_conversation(
	buyer_id: str = Query(..., min_length=1),
	seller_id: str = Query(..., min_length=1),
	page: int = Query(1, ge=1),
	user_response=Depends(get_user_from_token),
):
	"""Return the newest page of messages for a buyer-seller conversation."""

	if not user_response.status:
		content = api_response(False, "The access token provided is not valid")
		return JSONResponse(content.to_dict(), 401)

	if not user_response.payload:
		content = api_response(False, "The access token is expired, refresh and try again")
		return JSONResponse(content.to_dict(), 205)

	service = ConversationService()
	conversation_messages = await service.get_messages(buyer_id, seller_id, page)
	content = api_response(True, "The conversation has been retrieved successfully", conversation_messages)
	return JSONResponse(content.to_dict())
