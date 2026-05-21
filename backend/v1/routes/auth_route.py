""" a module to get and use the authentication routes"""

from fastapi import APIRouter, Request, Depends
from fastapi.responses import JSONResponse
from argon2.exceptions import VerifyMismatchError

from models.user import UserCreate, User
from database.db_engine import storage
from utils.responses import api_response
from utils.cookie_token import token_manager
from utils.email_checker import email_domain_checker
from utils.password import ph, password_strength_checker
from middlewares.verify_user import get_user_from_token
from services.email_sender import email_sender

auth = APIRouter(prefix="/auth", tags=["Authentication"])

@auth.post("/login")
async def login(user_data: UserCreate):
    """
    Passwordless login - Send OTP to email
    Args:
        user_data: Dict containing only email
    """

    email = user_data.email
    
    # Check if user exists
    get_user_response = storage.get_user_by_email(email)
    
    if get_user_response.status:
        # Create tokens (for session)
        access_token_response = token_manager.create_access_token(saved_user.get("_id"))
        refresh_token_response = token_manager.create_refresh_token(saved_user.get("_id"))

        # Existing user - send OTP if the user email is not verified
        saved_user = get_user_response.payload

        # check the user password and the provided password
        try:
            ph.verify(saved_user.get("password"), user_data.password)
        except VerifyMismatchError:
            content = api_response(False, "The password is incorrect")
            return JSONResponse(content.to_dict())

        # check if the user is verified before moving on to the next step
        if not saved_user.get("is_verified"):
            # try sending the user otp code and move to the otp confirmation page

            # Send OTP
            email_send_response = email_sender.send_otp_mail(email)
            if not email_send_response.status:
                content = api_response(False, "OTP code send limit reached. Please try again later.")
                return JSONResponse(content.to_dict())

            content = api_response(
                True, 
                "OTP sent to your email", 
                {"email": email, "is_new_user": False}, 
                "/otp/verify"
            )

            response = JSONResponse(content.to_dict())
            response.set_cookie("access_token", access_token_response.payload.get("access_token"))
            response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"))
            
            return response
        
        elif not saved_user.get("first_name"):
            # redirect to the update information page

            content = api_response(
                True,
                "Verified User found rediirect to the update information page",
                saved_user,
                "/update-info-page"
            )

            response = JSONResponse(content.to_dict())
            response.set_cookie("access_token", access_token_response.get("access_token"))
            response.set_cookie("refresh_token", refresh_access_token.get("refresh_token"))

            return response
        
        # return to the user dashboard for a user
        content = api_response(True, "Log in successful", saved_user, "user/dashboard")

        response = JSONResponse(content.to_dict())
        response.set_cookie("access_token", access_token_response.get("access_token"))
        response.set_cookie("refresh_token", refresh_token_response.get("refresh_token"))

        return response

    else:
        # New user - create account and send OTP
        
        # Validate email domain
        email_response = email_domain_checker(email)
        if not email_response.status:
            content = api_response(False, "This email domain is not supported")
            return JSONResponse(content.to_dict())
        
        # check the password
        password_response = password_strength_checker(user_data.password)
        if not password_response.status:
            content = api_response(False, "The password is not up to standard")
            return JSONResponse(content.to_dict())

        # Create new user (no password needed)
        user = User(
            email=email,
            password=user_data.password
        )

        # Save user to database
        save_user_response = user.save()
        if not save_user_response.status:
            content = api_response(False, "Failed to create account. Please try again.")
            return JSONResponse(content.to_dict())

        user_id = save_user_response.payload.get("user_id")
        print(f"✅ New user created with ID: {user_id}")

        # Send OTP
        email_send_response = email_sender.send_otp_mail(email)
        if not email_send_response.status:
            content = api_response(False, "Failed to send OTP. Please try again.")
            return JSONResponse(content.to_dict())

        # Create tokens
        access_token_response = token_manager.create_access_token(user_id)
        refresh_token_response = token_manager.create_refresh_token(user_id)

        content = api_response(
            True, 
            "Account created! OTP sent to your email",
            {"email": email, "is_new_user": True},
            "/otp/verify"
        )

        response = JSONResponse(content.to_dict())
        response.set_cookie("access_token", access_token_response.payload.get("access_token"))
        response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"))

        print(f"✅ OTP sent to new user")
        return response


@auth.get("/token/refresh")
def refresh_access_token(request: Request):
    """ a method to refresh the access token of the user and the refresh token"""

    refresh_token = request.cookies.get("refresh_token")

    get_id_response = token_manager.verify_refresh_token(refresh_token)
    if not get_id_response.status:
        content = api_response(False, "The refresh token is not valid")
        response = JSONResponse(content.to_dict())
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

    access_token_response = token_manager.create_access_token(get_id_response.payload.get("user_id"))
    refresh_token_response = token_manager.create_refresh_token(get_id_response.payload.get("user_id"))

    # get the user id and create a new access and refresh token for the user
    content = api_response(True, "A new access Token has been created succefully")
    response = JSONResponse(content.to_dict())
    response.set_cookie("access_token", access_token_response.payload.get("access_token"))
    response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"))
    return response


@auth.post("/otp/verify")
def verify_otp_code(otp_code: str, user_response = Depends(get_user_from_token)):
    """ a function to verify a user and update the user is_verified status to true
    Args:
        otp_code (str): the otp code present in the request body
    """

    print(f"\n🔐 OTP verification request: {otp_code}")
    
    # ensure the user is a valid user with records in the database
    if not user_response.status:
        content = api_response(False, "The user is not authenticated")
        return JSONResponse(content.to_dict())
    
    if not user_response.payload:
        content = api_response(False, "Please refresh your token to continue using this service")
        return JSONResponse(content.to_dict())
    
    # use the storage use the otp manager to confirm that the otp code is a valid code
    otp_email_response = storage.get_code_email(otp_code)
    if not otp_email_response.status:
        print("❌ Invalid OTP code")
        content = api_response(False, "Invalid or expired OTP code")
        return JSONResponse(content.to_dict())
    
    user = user_response.payload
    otp_email = otp_email_response.payload.get("email")
    
    if user.get("email") != otp_email:
        print(f"❌ OTP email mismatch: {user.get('email')} vs {otp_email}")
        content = api_response(False, "This OTP code is not for your email address")
        return JSONResponse(content.to_dict())
    
    # if both email correspond update the email address to become a verified user and redirect to the select role page
    storage.update_user_by_id(user.get("_id"), is_verified=True)
    
    print(f"✅ User verified successfully: {user.get('email')}")
    content = api_response(True, "Email verified successfully!", next_url="/select/roles")
    return JSONResponse(content.to_dict())


# create an endpoint to process resend of otp codes
@auth.get("/otp/resend")
def resend_otp_code(user_response=Depends(get_user_from_token)):
    """ a function to resend an otp code to the user"""

    print("\n📧 OTP resend request")
    
    if not user_response.status:
        content = api_response(False, "The token is not provided")
        return JSONResponse(content.to_dict())
    
    if not user_response.payload:
        content = api_response(False, "Refresh the access token to continue using this service")
        return JSONResponse(content.to_dict())
    
    user = user_response.payload

    if user.get("is_verified"):
        print("⚠️  User already verified")
        content = api_response(True, "You are already verified")
        return JSONResponse(content.to_dict())
    
    email_send_response = email_sender.send_otp_mail(user.get("email"))
    if not email_send_response.status:
        print("❌ Failed to send OTP")
        content = api_response(False, "Failed to send OTP. Please try again later.")
        return JSONResponse(content.to_dict())
    
    print(f"✅ OTP resent to: {user.get('email')}")
    content = api_response(True, "New OTP sent to your email")
    return JSONResponse(content.to_dict())