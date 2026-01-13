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
def login(user: UserCreate):
    """A function to login users to the API
    Args:
        user: (Dict): the user email and password
    """

    #check if a user exists with the provided email and password
    get_user_response = storage.get_user_by_email(user.email)

    if get_user_response.status:
        saved_user = get_user_response.payload
        try:
            ph.verify(saved_user.get("password"), user.password)
        except VerifyMismatchError:
            content = api_response(False, "the password is not correct")
            return JSONResponse(content.to_dict())

        # create the access and refresh token and set the access and refresh tokens
        access_token_response = token_manager.create_access_token(saved_user.get("_id"))
        refresh_token_response = token_manager.create_refresh_token(saved_user.get("_id"))

        if not saved_user.get("is_verified"):
            # send the otp code to the user
            email_send_response = email_sender.send_otp_mail(saved_user.get("email"))
            if not email_send_response.status:
                content = api_response(False, "Otp code send limit is reached")
                return JSONResponse(content.to_dict())

            content = api_response(True, "A non verified user is found", saved_user, "/otp/verify")
            response = JSONResponse(content.to_dict())
            response.set_cookie("access_token", access_token_response.payload.get("access_token"))
            response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"))
            return response

        content = api_response(True, "A verified user is found", saved_user, "/roles/select")
        response = JSONResponse(content.to_dict())
        response.set_cookie("access_token", access_token_response.payload.get("access_token"))
        response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"))
        return response

    # if no user exists with that emai
    user = User(**user.model_dump())
    email_response = email_domain_checker(user.email)

    # check if the email domain is among our list of valid email domains
    if not email_response.status:
        content = api_response(False, "The email domain of the user is not among the list of valid domains")
        return JSONResponse(content.to_dict())

    # check the strength of the password
    password_strength = password_strength_checker(user.password)
    if not password_strength.status:
        content = api_response(False, "The password is not strong enough")
        return JSONResponse(content.to_dict())

    # send the otp code to the user email address and save the code and the email  of the user to the it to the database
    email_send_response = email_sender.send_otp_mail(user.email)
    if not email_send_response.status:
        # the send failed i would have to manage this edge case latter
        content = api_response(False, "The otp code send failed")
        return JSONResponse(content.to_dict())

    # save the user to the database
    user.password = ph.hash(user.password)
    save_user_response = user.save()
    if not save_user_response.status:
        content = api_response(False, "The user was not successfully created please try again")
        return JSONResponse(content.to_dict())
    

    user_id = save_user_response.payload.get("user_id")
    access_token_response = token_manager.create_access_token(user_id)
    refresh_token_response = token_manager.create_refresh_token(user_id)

    # return a response of successful execution along with the user object to the frontend and a redirect to the otp page
    content = api_response(True, "A user has been created succefully", user.to_dict(), next_url="/otp/verify")
    response = JSONResponse(content.to_dict())
    response.set_cookie("access_token", access_token_response.payload.get("access_token"))
    response.set_cookie("refresh_token", refresh_token_response.payload.get("refresh_token"))
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

    # ensure the user is a a valid user with records in the database
    if not user_response.status:
        content = api_response(False, "The user is not authenticated")
        return JSONResponse(content.to_dict())
    
    if not user_response.payload:
        content = api_response(False, "Please refresh your token to continue using this service")
        return JSONResponse(content.to_dict())
    
    # use the storage use the otp manager to confirm that the otp code is a valid code
    otp_email_response = storage.get_code_email(otp_code)
    if not otp_email_response.status:
        content = api_response(False, "The otp code provided is not provided by our service")
        return JSONResponse(content.to_dict())
    
    user = user_response.payload
    if user.get("email") != otp_email_response.payload.get("email"):
        content = api_response(False, "The provided otp is not for this email address")
        return JSONResponse(content.to_dict())
    
    # if both email correspond update the email address to become a verified user and redirect to the select role page
    storage.update_user_by_id(user.get("_id"), is_verified=True)
    content = api_response(True, "The user has been updated successfuly", next_url="/select/roles")
    return JSONResponse(content.to_dict())

# create an endpooint to process resend of otp codes
@auth.get("/otp/resend")
def resend_otp_code(user_response=Depends(get_user_from_token)):
    """ a function to resend the an otp code to the user"""

    if not user_response.status:
        content = api_response(False, "The token is not provided")

        return JSONResponse(content.model_dump)
    
    if  not user_response.payload:
        content = api_response(True, "Refresh the access token to continue using this service")
        return JSONResponse(content.to_dict())
    
    user = user_response.payload

    if user.get("is_verified"):
        content = api_response(True, "The user is already verified\n Login and select a role")

        return JSONResponse(content.to_dict())
    
    email_send_response = email_sender.send_otp_mail(user.get("email"))
    if not email_send_response.status:
        content = api_response(False, "The email was not sent")
        return JSONResponse(content.to_dict())
    
    content = api_response(True, "The email is successfully sent")
    return JSONResponse(content.to_dict())
