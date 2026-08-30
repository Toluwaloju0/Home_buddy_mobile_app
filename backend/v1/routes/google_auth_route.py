""" a module for Google OAuth authentication """

from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import requests as http_requests
from io import BytesIO
from types import SimpleNamespace

from models.user import User, UserRole
from database.db_engine import DBStorage
from database.get_db import get_db
from utils.responses import api_response, function_response
from utils.cookie_token import token_manager
from utils.settings import settings
from services.s3_uploader import uploader

google_auth = APIRouter(prefix="/auth/google", tags=["Google Authentication"])

GOOGLE_CLIENT_ID = settings.google_client_id
FRONTEND_URL = settings.frontend_url

@google_auth.post("/verify")
async def verify_google_token(request: Request, storage: DBStorage = Depends(get_db)):
    """Verify Google OAuth token and log the user in."""

    try:
        body = await request.json()
        token = body.get('credential', {})

        if not token:
            content = api_response(False, "No credential provided")
            return JSONResponse(content.to_dict(), status_code=400)
        
        if not GOOGLE_CLIENT_ID:
            content = api_response(False, "Google OAuth not configured on server")
            return JSONResponse(content.to_dict(), status_code=500)

        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )

        # check if the email address is verified by google
        if not idinfo.get("email_verified", False):
            content = api_response(False, "Email not verified by Google")
            return JSONResponse(content.to_dict(), status_code=400)

        # check if a user with the email address exists
        get_user_response = await storage.find_user_by_email(idinfo.get("email", None))
        # if the user does not exists, write the user to the database and upload the image and return the cookies and user object
        if not get_user_response.status:
            user = User(
                email=idinfo.get("email"),
                password=None,
                first_name=idinfo.get("given_name"),
                last_name=idinfo.get("family_name"),
                role=UserRole.BUYER,
                is_verified=True
            )

            save_user_response = await storage.save_user(**user.to_dict())
            if not save_user_response.status:
                content = api_response(False, "Failed to create account. Please try again.")
                return JSONResponse(content.to_dict(), 406)

            # upload the image to the amazon bucket
            image_key = uploader.upload_image_from_public_url(save_user_response.payload.get('user_id'), idinfo.get("picture"))
            await storage.update_user_by_id(save_user_response.payload.get("user_id"), image_key=image_key)

            # get the user and return the user object
            get_user_response = await storage.get_user_by_id(save_user_response.payload.get("user_id"))
            user = get_user_response.payload if get_user_response.status else None
        else:
            # Create tokens
            user = get_user_response.payload
            # if the user is not verified automatically verify the user and if no image url/key for the user upload the google provided key
            if not user.get("is_verified"):
                await storage.update_user_by_id(user.get("_id", None), is_verified=True)

            if not user.get("image_url", None) or not user.get("image_key", None):
                # upload the image  provided by google to the s3 bucket and save the key to the database
                image_key = uploader.upload_image_from_public_url(user.get("_id"), idinfo.get("picture"))
                await storage.update_user_by_id(user.get("_id", None), image_key=image_key)

        # create the access and refresh tokens and return the response with the cookies
        access_token_response = await token_manager.create_access_token(user.get("_id"))
        refresh_token_response = await token_manager.create_refresh_token(user.get("_id"))

        content = api_response(True, "Login successful", user)

        response = JSONResponse(content.to_dict())
        response.set_cookie("access_token", access_token_response.payload.get("access_token"), httponly=True, samesite="none", secure=True)
        response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"), httponly=True, samesite="none", secure=True)    

        return response
    except Exception:
        content = api_response(False, "Authentication failed. Please try again.")
        print(content.to_dict(), "3")
        return JSONResponse(content.to_dict(), status_code=500)