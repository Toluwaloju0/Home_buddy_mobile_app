""" a module to get the user route and the CRUD process attached to it """

from typing import Dict
from fastapi import APIRouter, Depends, Body
from fastapi.responses import JSONResponse
from middlewares.verify_user import get_user_from_token
from argon2.exceptions import VerifyMismatchError
from pydantic import EmailStr

from database.db_engine import storage
from utils.responses import api_response
from utils.password import ph, password_strength_checker
from utils.email_checker import email_domain_checker
from services.email_sender import email_sender
from services.s3_uploader import uploader


# async def enrich_user_image(user_payload):
#     """Attach a browser-loadable avatar URL when the user stores an S3 object reference."""

#     if not user_payload or not user_payload.get("image_url"):
#         return user_payload

#     user_payload["image_url"] = await uploader.resolve_accessible_s3_url(
#         user_payload.get("image_url"),
#         user_payload.get("image_key"),
#     )
#     return user_payload

user = APIRouter(prefix="/user", tags=["Users"], dependencies=[Depends(get_user_from_token)])

@user.get("/me")
async def get_me(user_response = Depends(get_user_from_token)):
    """ a function to get the current user from the database """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 400)
    
    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)
    
    user = user_response.payload
    # user = await enrich_user_image(user)

    content = api_response(True, "The user has been retrieved successfully", user)
    return JSONResponse(content.to_dict())


@user.delete("/me")
async def delete_me(user_response = Depends(get_user_from_token)):
    """ a function to delete the user from the database totally
    Args:
        user_response: the response gotten from verifying the access token
    Return a response confirming the deletion of the user
    """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)
    
    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)
    
    user = user_response.payload

    await storage.delete_user(user.get("_id"))
    del user

    content = api_response(True, "The user has been deleted")
    response = JSONResponse(content.to_dict())
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")

    return response

@user.patch("/me/password")
async def update_me(payload: Dict[str, str] = Body(), user_response = Depends(get_user_from_token)):
    """A function for the enndpoint to update the value of the user in the database """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)
    
    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)
    
    user, old_password, new_password = user_response.payload, payload.get("old_password"), payload.get("new_password")

    if not old_password or not new_password or old_password == new_password:
        content = api_response(False, "The password required are not provided or the new password cant be the same with the old provided one")
        return JSONResponse(content.to_dict())
    
    password_strength_response = await password_strength_checker(new_password)
    if not password_strength_response.status:
        content = api_response(False, "The new password does not reach the required password strengthh please change it and try again")
        return JSONResponse(content.to_dict())
    
    update_response = await storage.update_password(user.get("_id"), old_password, new_password)

    if not update_response.status:
        content = api_response(False, "The update was not successful")
    else:
        content = api_response(True, "The password has been updated successfully")
    return JSONResponse(content.to_dict())

@user.patch("/me/email")
async def update_email(payload: Dict[str, EmailStr] = Body(), user_response = Depends(get_user_from_token)):
    """ a function to update the email address of the user """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)
    
    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    email = payload.get("new_email")
    if not email:
        content = api_response(False, "The new email address is not provided")
        return JSONResponse(content.to_dict(), 500)

    # confirm that the email address provided has a valid domain
    email_checker_response = await email_domain_checker(email)
    if not email_checker_response.status:
        content = api_response(False, "The email domain is not supported by our system")
        return JSONResponse(content.to_dict(), 500)
    
    user = user_response.payload

    if email == user.get("email"):
        content = api_response(True, "The email is not changed")
        return JSONResponse(content.to_dict(), 500)
    
    #send the appopraite mail to the user
    email_send_response = await email_sender.send_otp_mail(email)
    if not email_send_response.status:
        content = api_response(False, "The request failed because the otp code was not sent")
        return JSONResponse(content.to_dict(), 500)
    
    update_response = await storage.update_user_by_id(user.get("_id"), email=email, is_verified=False)
    if not update_response.status:
        content = api_response(False, "The update failed")
    content = api_response(True, "The email was reset successfully. Verify your email address to continue", payload=update_response.payload)
    return JSONResponse(content.to_dict())

@user.put("/me/update")
async def update_me(payload: Dict[str, str], user_response = Depends(get_user_from_token)):
    """ a method to update the user from the database
    Args:
        payload (Dict): the payload gotten from the request body definig what to change in the user instance
        user_response = the response gotten from the access token passed
    """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)
    
    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)
    
    user, update_dict = user_response.payload, {}
    if payload.get("first_name"):
        update_dict["first_name"] = payload.get("first_name")
    if payload.get("last_name"):
        update_dict["last_name"] = payload.get("last_name")
    if payload.get("phone_number"):
        update_dict["phone_number"] = payload.get("phone_number")
        update_dict["phone_number_verified"] = False
    
    if len(update_dict.keys()) < 1:
        content = api_response(True, "The neccessary data for the update was not found")
        return JSONResponse(content.to_dict())
    
    update_response = await storage.update_user_by_id(user.get("_id"), **update_dict)
    if not update_response.status:
        content = api_response(False, "The update saved to fail")
    else:
        content = api_response(True, "The update has completed successfully", payload=update_response.payload)

    return JSONResponse(content.to_dict())
