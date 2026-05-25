""" a module for Google OAuth authentication """

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

import requests as http_requests
from io import BytesIO
from types import SimpleNamespace

from models.user import User, UserRole
from database.db_engine import storage
from utils.responses import api_response, function_response
from utils.cookie_token import token_manager
from utils.settings import settings
from services.s3_uploader import uploader

google_auth = APIRouter(prefix="/auth/google", tags=["Google Authentication"])

GOOGLE_CLIENT_ID = settings.google_client_id
FRONTEND_URL = settings.frontend_url


@google_auth.post("/verify")
async def verify_google_token(request: Request):
    """Verify Google OAuth token and log the user in."""

    try:
        body = await request.json()
        token = body.get("credential")

        if not token:
            content = api_response(False, "No credential provided")
            return JSONResponse(content.to_dict(), status_code=400)
        
        if not GOOGLE_CLIENT_ID:
            content = api_response(False, "Google OAuth not configured on server")
            return JSONResponse(content.to_dict(), status_code=500)
        
        # Verify the token with Google
        try:
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                GOOGLE_CLIENT_ID
            )
            
            email = idinfo.get("email")
            
            # Extract user information
            email_verified = idinfo.get("email_verified")
            given_name = idinfo.get("given_name")
            family_name = idinfo.get("family_name")
            full_name = idinfo.get("name") or f"{given_name or ''} {family_name or ''}".strip()
            picture = idinfo.get("picture")
            
            if not email_verified:
                content = api_response(False, "Email not verified by Google")
                return JSONResponse(content.to_dict(), status_code=400)
            
        except ValueError as e:
            content = api_response(False, f"Invalid Google token. Please try again.")
            return JSONResponse(content.to_dict(), status_code=400)
            
        except Exception as e:
            content = api_response(False, f"Verification error: {str(e)}")
            return JSONResponse(content.to_dict(), status_code=500)
        
        # local helper to download and upload the google profile picture to S3
        async def _upload_picture_to_s3(picture_url, user_id, existing_object_key=None):
            if not picture_url:
                return function_response(False)
            try:
                resp = http_requests.get(picture_url, timeout=10)
                resp.raise_for_status()
                content_type = resp.headers.get("Content-Type") or "image/jpeg"
                content = resp.content
                bio = BytesIO(content)
                bio.seek(0)
                temp_file = SimpleNamespace(file=bio, content_type=content_type, filename="google_profile")
                return await uploader.replace_profile_image(temp_file, user_id, existing_object_key)
            except Exception:
                return function_response(False)

        # Check if user exists
        get_user_response = await storage.find_user_by_email(email)
        
        if get_user_response.status:
            saved_user = get_user_response.payload
            user_id = str(saved_user.get("_id"))
            
            update_data = {}
            if given_name:
                update_data["first_name"] = given_name
            if family_name:
                update_data["last_name"] = family_name
            if full_name and not (saved_user.get("first_name") or saved_user.get("last_name")):
                parts = full_name.split()
                if parts:
                    update_data.setdefault("first_name", parts[0])
                    update_data.setdefault("last_name", " ".join(parts[1:]) if len(parts) > 1 else "")
            update_data["is_verified"] = True
            update_data["role"] = UserRole.BOTH.value
            update_data["password"] = None

            # attempt to upload picture and set image_url/key
            if picture:
                existing_profile_key = uploader.extract_s3_key_from_url(saved_user.get("image_url")) or saved_user.get("image_key")
                upload_resp = await _upload_picture_to_s3(picture, user_id, existing_profile_key)
                if upload_resp.status:
                    update_data["image_url"] = upload_resp.payload.get("url")
                    update_data["image_key"] = upload_resp.payload.get("key")
            
            if update_data:
                await storage.update_user_by_id(user_id, **update_data)
            # Ensure seller profile exists
            seller_resp = await storage.get_seller_by_user_id(user_id)
            if not seller_resp.status:
                await storage.create_seller_profile(user_id, {"is_verified": True})
            
        else:
            # create new user with role BOTH and no password
            user = User(
                email=email,
                first_name=given_name or (full_name.split()[0] if full_name else email.split('@')[0]),
                last_name=family_name or (" ".join(full_name.split()[1:]) if full_name and len(full_name.split()) > 1 else ""),
                is_verified=True,
                role=UserRole.BOTH,
                password=None
            )
            
            save_user_response = await user.save()
            if not save_user_response.status:
                content = api_response(False, "Failed to create user account")
                return JSONResponse(content.to_dict(), status_code=500)
            
            user_id = str(save_user_response.payload.get("user_id"))
            # upload picture if present
            if picture:
                upload_resp = await _upload_picture_to_s3(picture, user_id)
                if upload_resp.status:
                    await storage.update_user_by_id(user_id, image_url=upload_resp.payload.get("url"), image_key=upload_resp.payload.get("key"))
            await storage.create_seller_profile(user_id, {"is_verified": True})
        
        # Create tokens for session
        access_token_response = await token_manager.create_access_token(user_id)
        refresh_token_response = await token_manager.create_refresh_token(user_id)
        
        user_record = await storage.get_user_by_id(user_id)
        payload = user_record.payload if user_record.status else {"email": email, "role": UserRole.BOTH.value, "is_verified": True}

        content = api_response(
            True, 
            "Google authentication successful.", 
            payload,
            next_url=f"{FRONTEND_URL}/buyer" if FRONTEND_URL else "/buyer"
        )
        
        response = JSONResponse(content.to_dict())
        response.set_cookie(
            key="access_token",
            value=access_token_response.payload.get("access_token"),
            httponly=True,
            samesite="lax"
        )
        response.set_cookie(
            key="refresh_token",
            value=refresh_token_response.payload.get("refresh_token"),
            httponly=True,
            samesite="lax"
        )
        return response
        
    except Exception as e:
        content = api_response(False, "Authentication failed. Please try again.")
        return JSONResponse(content.to_dict(), status_code=500)