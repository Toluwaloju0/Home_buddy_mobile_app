""" a module for Google OAuth authentication """

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from models.user import User, UserRole
from database.db_engine import storage
from utils.responses import api_response
from utils.cookie_token import token_manager
from utils.settings import settings

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
            
            if not email_verified:
                content = api_response(False, "Email not verified by Google")
                return JSONResponse(content.to_dict(), status_code=400)
            
        except ValueError as e:
            content = api_response(False, f"Invalid Google token. Please try again.")
            return JSONResponse(content.to_dict(), status_code=400)
            
        except Exception as e:
            content = api_response(False, f"Verification error: {str(e)}")
            return JSONResponse(content.to_dict(), status_code=500)
        
        # Check if user exists
        get_user_response = await storage.find_user_by_email(email)
        
        if get_user_response.status:
            saved_user = get_user_response.payload
            user_id = str(saved_user.get("_id"))
            
            update_data = {}
            if not saved_user.get("first_name") and given_name:
                update_data["first_name"] = given_name
            if not saved_user.get("last_name") and family_name:
                update_data["last_name"] = family_name
            update_data["is_verified"] = True
            update_data["role"] = UserRole.SELLER.value
            
            if update_data:
                await storage.update_user_by_id(user_id, **update_data)
            await storage.create_seller_profile(user_id, is_verified=True)
            
        else:
            user = User(
                email=email,
                first_name=given_name or email.split('@')[0],
                last_name=family_name or "",
                is_verified=True,
                role=UserRole.SELLER,
                password=None
            )
            
            save_user_response = await user.save()
            if not save_user_response.status:
                content = api_response(False, "Failed to create user account")
                return JSONResponse(content.to_dict(), status_code=500)
            
            user_id = str(save_user_response.payload.get("user_id"))
            await storage.create_seller_profile(user_id, is_verified=True)
        
        # Create tokens for session
        access_token_response = await token_manager.create_access_token(user_id)
        refresh_token_response = await token_manager.create_refresh_token(user_id)
        
        user_record = await storage.get_user_by_id(user_id)
        payload = user_record.payload if user_record.status else {"email": email, "role": UserRole.SELLER.value, "is_verified": True}

        content = api_response(
            True, 
            "Google authentication successful.", 
            payload
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