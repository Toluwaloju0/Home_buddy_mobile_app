""" a module for Google OAuth authentication """

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from os import getenv

from models.user import User
from database.db_engine import storage
from utils.responses import api_response
from utils.cookie_token import token_manager
from services.email_sender import email_sender

google_auth = APIRouter(prefix="/auth/google", tags=["Google Authentication"])

GOOGLE_CLIENT_ID = getenv("GOOGLE_CLIENT_ID")
FRONTEND_URL = getenv("FRONTEND_URL", "http://localhost:3000")

print(f"🔑 Google OAuth configured with Client ID: {GOOGLE_CLIENT_ID[:20]}..." if GOOGLE_CLIENT_ID else "❌ GOOGLE_CLIENT_ID not set!")


@google_auth.post("/verify")
async def verify_google_token(request: Request):
    """Verify Google OAuth token, send OTP, and redirect to verification"""
    
    print("\n" + "="*60)
    print("📧 Google OAuth verification request received")
    print("="*60)
    
    try:
        body = await request.json()
        token = body.get("credential")
        
        print(f"🔐 Token received: {token[:50]}..." if token else "❌ No token in request")
        
        if not token:
            content = api_response(False, "No credential provided")
            return JSONResponse(content.to_dict(), status_code=400)
        
        if not GOOGLE_CLIENT_ID:
            print("❌ ERROR: GOOGLE_CLIENT_ID not configured in backend .env!")
            content = api_response(False, "Google OAuth not configured on server")
            return JSONResponse(content.to_dict(), status_code=500)
        
        # Verify the token with Google
        try:
            print("🔍 Verifying token with Google...")
            idinfo = id_token.verify_oauth2_token(
                token, 
                google_requests.Request(), 
                GOOGLE_CLIENT_ID
            )
            
            email = idinfo.get("email")
            print(f"✅ Token verified successfully!")
            print(f"   Email: {email}")
            print(f"   Email Verified: {idinfo.get('email_verified')}")
            print(f"   Name: {idinfo.get('name')}")
            
            # Extract user information
            email_verified = idinfo.get("email_verified")
            given_name = idinfo.get("given_name")
            family_name = idinfo.get("family_name")
            
            if not email_verified:
                print("❌ Email not verified by Google")
                content = api_response(False, "Email not verified by Google")
                return JSONResponse(content.to_dict(), status_code=400)
            
        except ValueError as e:
            error_msg = str(e)
            print(f"❌ Token verification failed: {error_msg}")
            
            if "Wrong recipient" in error_msg or "audience" in error_msg.lower():
                print("💡 Hint: Check that GOOGLE_CLIENT_ID in backend matches frontend")
            
            content = api_response(False, f"Invalid Google token. Please try again.")
            return JSONResponse(content.to_dict(), status_code=400)
            
        except Exception as e:
            print(f"❌ Unexpected error during verification: {str(e)}")
            content = api_response(False, f"Verification error: {str(e)}")
            return JSONResponse(content.to_dict(), status_code=500)
        
        # Check if user exists
        print(f"\n🔍 Checking if user exists in database...")
        get_user_response = storage.get_user_by_email(email)
        
        if get_user_response.status:
            # User exists - update info and send OTP
            print(f"✅ Existing user found: {email}")
            saved_user = get_user_response.payload
            user_id = str(saved_user.get("_id"))
            
            # Update user info if needed
            update_data = {}
            if not saved_user.get("first_name") and given_name:
                update_data["first_name"] = given_name
            if not saved_user.get("last_name") and family_name:
                update_data["last_name"] = family_name
            # Mark as not verified to require OTP
            update_data["is_verified"] = False
            
            if update_data:
                print(f"   Updating user info: {list(update_data.keys())}")
                storage.update_user_by_id(user_id, **update_data)
            
        else:
            # User doesn't exist - create new user
            print(f"📝 New user detected, creating account for: {email}")
            user = User(
                email=email,
                first_name=given_name or email.split('@')[0],
                last_name=family_name or "",
                is_verified=False,  # Require OTP verification
                password=""  # No password for OAuth users
            )
            
            save_user_response = user.save()
            if not save_user_response.status:
                print("❌ Failed to save user to database")
                content = api_response(False, "Failed to create user account")
                return JSONResponse(content.to_dict(), status_code=500)
            
            user_id = str(save_user_response.payload.get("user_id"))
            print(f"✅ User created successfully!")
            print(f"   User ID: {user_id}")
            print(f"   Name: {given_name} {family_name}")
        
        # Send OTP to Google email
        print(f"\n📧 Sending OTP to Google email: {email}")
        email_send_response = email_sender.send_otp_mail(email)
        
        if not email_send_response.status:
            print("❌ Failed to send OTP")
            content = api_response(False, "Failed to send OTP. Please try again.")
            return JSONResponse(content.to_dict(), status_code=500)
        
        print(f"✅ OTP sent successfully to: {email}")
        
        # Create tokens for session
        print("🔑 Generating authentication tokens...")
        access_token_response = token_manager.create_access_token(user_id)
        refresh_token_response = token_manager.create_refresh_token(user_id)
        
        # Prepare response - redirect to OTP verification
        content = api_response(
            True, 
            "OTP sent to your Google email. Please verify.", 
            {"email": email, "provider": "google"}, 
            "/otp/verify"
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
        
        print(f"✅ Google authentication successful! Redirecting to OTP verification")
        print("="*60 + "\n")
        return response
        
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR in Google OAuth:")
        print(f"   Error type: {type(e).__name__}")
        print(f"   Error message: {str(e)}")
        import traceback
        traceback.print_exc()
        print("="*60 + "\n")
        
        content = api_response(False, "Authentication failed. Please try again.")
        return JSONResponse(content.to_dict(), status_code=500)