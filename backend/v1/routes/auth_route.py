""" a module to get and use the authentication routes"""

from fastapi import APIRouter, Request, Depends, Body
from fastapi.responses import JSONResponse
from argon2.exceptions import VerifyMismatchError

from models.user import UserCreate, User, UserRegister, UserRole
from database.db_engine import storage, DBStorage
from database.get_db import get_db
from utils.responses import api_response
from utils.cookie_token import token_manager
from utils.email_checker import email_domain_checker
from utils.password import ph, password_strength_checker
from middlewares.verify_user import get_user_from_token
from services.email_sender import email_sender

auth = APIRouter(prefix="/auth", tags=["Authentication"])


@auth.post("/register")
async def register(user_data: UserRegister):
    """ Register a new user with email, name, role, password and phone number """

    email = user_data.email

    # ensure domain is allowed
    email_response = await email_domain_checker(email)
    if not email_response.status:
        content = api_response(False, "This email domain is not supported")
        return JSONResponse(content.to_dict(), 406)

    # check if user already exists
    existing_user = await storage.find_user_by_email(email.lower())
    if existing_user.status:
        content = api_response(False, "A user with this email already exists")
        return JSONResponse(content.to_dict(), 409)

    # password strength
    password_response = await password_strength_checker(user_data.password)
    if not password_response.status:
        content = api_response(False, "The password is not up to standard")
        return JSONResponse(content.to_dict(), 406)

    # prepare user object (hash password)
    hashed_password = ph.hash(user_data.password) if user_data.password else None

    user = User(
        email=email.lower(),
        password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=user_data.role.value if getattr(user_data, 'role', None) else UserRole.BUYER,
        phone_number=user_data.phone_number,
        is_verified=False
    )

    # Save user to database
    save_user_response = await storage.save_user(**user.to_dict())
    if not save_user_response.status:
        content = api_response(False, "Failed to create account. Please try again.")
        return JSONResponse(content.to_dict(), 406)

    user_id = save_user_response.payload.get("user_id", None)

    # Send OTP
    email_send_response = await email_sender.send_otp_mail(email)
    if not email_send_response.status:
        content = api_response(False, "Failed to send OTP. Please try again.")
        return JSONResponse(content.to_dict(), 406)

    # Create tokens
    access_token_response = await token_manager.create_access_token(user_id)
    refresh_token_response = await token_manager.create_refresh_token(user_id)

    # fetch sanitized user record to return as payload
    user_record_resp = await storage.get_user_by_id(str(user_id))
    payload = user_record_resp.payload if user_record_resp.status else {"email": email, "is_new_user": True}

    content = api_response(
        True,
        "Account created! OTP sent to your email",
        payload
    )

    response = JSONResponse(content.to_dict())
    response.set_cookie("access_token", access_token_response.payload.get("access_token"), httponly=True, samesite="none", secure=True)
    response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"), httponly=True, samesite="none", secure=True)

    return response

@auth.post("/login")
async def login(user_data: UserCreate):
    """
    Passwordless login - Send OTP to email
    Args:
        user_data: Dict containing only email
    """

    email = user_data.email
    password = user_data.password

    get_user_response = await storage.get_user_by_email(email, password)
    if not get_user_response.status:
        content = api_response(False, "Incorrect email or password. If you don't have an account, please sign up.")
        return JSONResponse(content.to_dict(), 403)

    saved_user = get_user_response.payload

    # Create tokens
    access_token_response = await token_manager.create_access_token(saved_user.get("_id"))
    refresh_token_response = await token_manager.create_refresh_token(saved_user.get("_id"))

    # If user is not verified, send OTP and return the user payload
    if not saved_user.get("is_verified"):
        email_send_response = await email_sender.send_otp_mail(email)
        if not email_send_response.status:
            content = api_response(False, "OTP code send limit reached. Please try again later.")
            return JSONResponse(content.to_dict(), 423)

        content = api_response(True, "OTP sent to your email", saved_user)
        response = JSONResponse(content.to_dict())
        response.set_cookie("access_token", access_token_response.payload.get("access_token"), httponly=True, samesite="none", secure=True)
        response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"), httponly=True, samesite="none", secure=True)
        return response

    # Successful password login — return sanitized user payload
    content = api_response(True, "Log in successful", saved_user)
    response = JSONResponse(content.to_dict())
    response.set_cookie("access_token", access_token_response.payload.get("access_token"), httponly=True, samesite="none", secure=True)
    response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"), httponly=True, samesite="none", secure=True)
    return response

@auth.get("/token/refresh")
async def refresh_access_token(request: Request):
    """ a method to refresh the access token of the user and the refresh token"""

    refresh_token = request.cookies.get("refresh_token")

    get_id_response = await token_manager.verify_refresh_token(refresh_token)
    if not get_id_response.status:
        content = api_response(False, "The refresh token is not valid")
        response = JSONResponse(content.to_dict(), 400)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

    access_token_response = await token_manager.create_access_token(get_id_response.payload.get("user_id"))
    refresh_token_response = await token_manager.create_refresh_token(get_id_response.payload.get("user_id"))

    # get the user id and create a new access and refresh token for the user
    content = api_response(True, "A new access Token has been created succefully")
    response = JSONResponse(content.to_dict())
    response.set_cookie("access_token", access_token_response.payload.get("access_token"), httponly=True, samesite="none", secure=True)
    response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"), httponly=True, samesite="none", secure=True)
    return response


@auth.post("/otp/verify")
async def verify_otp_code(otp_code: str, user_response = Depends(get_user_from_token)):
    """ a function to verify a user and update the user is_verified status to true
    Args:
        otp_code (str): the otp code present in the request body
    """
    
    # ensure the user is a valid user with records in the database
    if not user_response.status:
        content = api_response(False, "The user is not authenticated")
        return JSONResponse(content.to_dict(), 400)
    
    if not user_response.payload:
        content = api_response(False, "Please refresh your token to continue using this service")
        return JSONResponse(content.to_dict(), 205)
    
    # use the storage use the otp manager to confirm that the otp code is a valid code
    otp_email_response = await storage.get_code_email(otp_code)
    if not otp_email_response.status:
        content = api_response(False, "Invalid or expired OTP code")
        return JSONResponse(content.to_dict(), 500)
    
    user = user_response.payload
    otp_email = otp_email_response.payload.get("email")
    
    if user.get("email").lower() != otp_email.lower():
        content = api_response(False, "This OTP code is not for your email address")
        return JSONResponse(content.to_dict(), 500)
    
    # if both email correspond update the email address to become a verified user
    await storage.update_user_by_id(user.get("_id"), is_verified=True)

    # fetch updated sanitized user
    updated_user_resp = await storage.get_user_by_id(str(user.get("_id")))
    updated_user = updated_user_resp.payload if updated_user_resp.status else user

    content = api_response(True, "Email verified successfully!", updated_user)
    return JSONResponse(content.to_dict())


# create an endpoint to process resend of otp codes
@auth.get("/otp/resend")
async def resend_otp_code(user_response=Depends(get_user_from_token)):
    """ a function to resend an otp code to the user"""
    
    if not user_response.status:
        content = api_response(False, "The user is unauthenticated, please login to continue using this service")
        return JSONResponse(content.to_dict(), 400)
    
    if not user_response.payload:
        content = api_response(False, "Refresh the access token to continue using this service")
        return JSONResponse(content.to_dict(), 205)
    
    user = user_response.payload

    if user.get("is_verified"):
        content = api_response(True, "You are already verified")
        return JSONResponse(content.to_dict())
    
    email_send_response = await email_sender.send_otp_mail(user.get("email"))
    if not email_send_response.status:
        content = api_response(False, "Failed to send OTP. Please try again later.")
        return JSONResponse(content.to_dict(), 500)
    
    content = api_response(True, "New OTP sent to your email")
    return JSONResponse(content.to_dict())


@auth.post("/admin/login")
async def admin_login(user_data: UserCreate):
    """
    Admin login using email and password. Only users with role 'admin' are allowed.
    """

    email = user_data.email
    password = user_data.password

    get_admin_response = await storage.get_admin_by_email(email, password)
    if not get_admin_response.status:
        content = api_response(False, "Incorrect email or password.")
        return JSONResponse(content.to_dict(), 403)

    saved_user = get_admin_response.payload

    # Ensure the user has admin role
    if saved_user.get("role") != UserRole.ADMIN.value:
        content = api_response(False, "Unauthorized: not an admin")
        return JSONResponse(content.to_dict(), 403)

    # Create tokens for the admin
    access_token_response = await token_manager.create_access_token(saved_user.get("_id"))
    refresh_token_response = await token_manager.create_refresh_token(saved_user.get("_id"))

    content = api_response(True, "Admin login successful", saved_user)
    response = JSONResponse(content.to_dict())
    response.set_cookie("access_token", access_token_response.payload.get("access_token"), httponly=True, samesite="none", secure=True)
    response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"), httponly=True, samesite="none", secure=True)
    return response


@auth.post("/admin/logout")
async def admin_logout(request: Request):
    """Logout endpoint for admin users — clears cookies and deletes refresh token."""

    refresh_token = request.cookies.get("refresh_token")

    # try to get the user id from the refresh token if present
    if refresh_token:
        get_id_response = await token_manager.verify_refresh_token(refresh_token)
        if get_id_response.status and get_id_response.payload:
            user_id = get_id_response.payload.get("user_id")
            try:
                # delete any refresh tokens for this user
                await storage.delete_refresh_token(user_id)
            except Exception:
                # continue even if deletion fails
                pass

    # Always clear cookies on logout response
    content = api_response(True, "Logged out successfully")
    response = JSONResponse(content.to_dict())
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response


# @auth.post("/admin/refresh")
# async def refresh_admin_token(request: Request):
#     """ an endpoint to refresh the token provided by the user
#     Args:
#         request: the request in its entire form
#     """

#     refresh_token = request.cookies.get("refresh_token")

#     get_id_response = await token_manager.verify_refresh_token(refresh_token, is_user=False)
#     if not get_id_response.status:
#         content = api_response(False, "The refresh token is not valid")
#         response = JSONResponse(content.to_dict(), 400)
#         response.delete_cookie("access_token")
#         response.delete_cookie("refresh_token")
#         return response

#     access_token_response = await token_manager.create_access_token(get_id_response.payload.get("user_id"))
#     refresh_token_response = await token_manager.create_refresh_token(get_id_response.payload.get("user_id"))

#     # get the user id and create a new access and refresh token for the user
#     content = api_response(True, "A new access Token has been created succefully")
#     response = JSONResponse(content.to_dict())
#     response.set_cookie("access_token", access_token_response.payload.get("access_token"))
#     response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"))
#     return response


@auth.post("/logout")
async def logout(request: Request):
    """Logout the user by deleting refresh tokens and clearing cookies."""

    refresh_token = request.cookies.get("refresh_token")

    # try to get the user id from the refresh token if present
    if refresh_token:
        get_id_response = await token_manager.verify_refresh_token(refresh_token)
        if get_id_response.status and get_id_response.payload:
            user_id = get_id_response.payload.get("user_id")
            try:
                await storage.delete_refresh_token(user_id)
            except Exception:
                # continue even if deletion fails
                pass

    # Always clear cookies on logout response
    content = api_response(True, "Logged out successfully")
    response = JSONResponse(content.to_dict())
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return response

@auth.put("/password/reset")
async def reset_password(
    token: str,
    new_password:str = Body(...),
    storage: DBStorage = Depends(get_db)
):
    """ a function to reset the password of the user
    Args:
        token: the token sent to the user email address to verify that the user is the one requesting for a password reset
        new_password: the new password for the user
    """

    # check if the token is valid and present in the database
    from services.reset_token import ResetPassword
    token_response = await ResetPassword.compare_token(token)
    if not token_response:
        content = api_response(False, "The reset password token is invalid or expired")
        return JSONResponse(content.to_dict(), 400)

    # check if the new password is strong enough
    password_response = await password_strength_checker(new_password)
    if not password_response.status:
        content = api_response(False, "The new password is not strong enough")
        return JSONResponse(content.to_dict(), 406)

    # hash the new password and update the user password in the database
    hashed_password = ph.hash(new_password)
    await storage.update_user_by_id(token_response.get("user_id"), password=hashed_password)

    content = api_response(True, "Password reset successful")
    return JSONResponse(content.to_dict())

@auth.post("/reset/password")
async def request_password_reset(email: str, storage: DBStorage = Depends(get_db)):
    """ an endpoint for users to request for a password reset link
    Args:
        email: the email address of the user
    """

    #  check if the email address belongs to a valid user

    user_response = await storage.find_user_by_email(email.lower())
    if not user_response.status:
        content = api_response(False, "No user found with this email address")
        return JSONResponse(content.to_dict(), 404)

    email_sender_response = await email_sender.send_reset_password_mail(user_response.payload.get("_id"), user_response.payload.get("email"))
    if not email_sender_response.status:
        content = api_response(False, email_sender_response.payload)
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "A password reset link has been sent to your email address")
    return JSONResponse(content.to_dict())
