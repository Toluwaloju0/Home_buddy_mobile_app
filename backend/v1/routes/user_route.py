""" a module to get the user route and the CRUD process attached to it """

from typing import Dict
from fastapi import APIRouter, Depends, Body, Form, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from middlewares.verify_user import get_user_from_token
from pydantic import EmailStr

from database.db_engine import DBStorage, storage
from models.user import UserRole
from utils.responses import api_response
from utils.password import password_strength_checker
from utils.email_checker import email_domain_checker
from database.get_db import get_db
from services.email_sender import email_sender
from services.s3_uploader import uploader

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
    if user.get("image_key"):
        user["image_url"] = uploader.create_url(user.get("image_key"))
        del user["image_key"]

    content = api_response(True, "The user has been retrieved successfully", user)
    return JSONResponse(content.to_dict())

@user.delete("/me")
async def delete_me(
    user_response = Depends(get_user_from_token),
    storage: DBStorage = Depends(get_db)
):
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
async def update_email(
    payload: Dict[str, EmailStr] = Body(),
    user_response = Depends(get_user_from_token),
    storage: DBStorage = Depends(get_db)
):
    """ a function to update the email address of the user """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)
    
    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    old_email = payload.get("old_email")
    email = payload.get("new_email")
    if not old_email or not email:
        content = api_response(False, "The old and new email addresses are required")
        return JSONResponse(content.to_dict(), 500)

    user = user_response.payload

    if old_email != user.get("email"):
        content = api_response(False, "The old email address does not match the current email address")
        return JSONResponse(content.to_dict(), 500)

    if old_email == email:
        content = api_response(False, "The new email address must be different from the old email address")
        return JSONResponse(content.to_dict(), 500)

    # confirm that the email address provided has a valid domain
    email_checker_response = await email_domain_checker(email)
    if not email_checker_response.status:
        content = api_response(False, "The email domain is not supported by our system")
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


@user.post("/switch-role")
async def switch_role(
    payload: Dict[str, str] = Body(...),
    user_response = Depends(get_user_from_token), 
    storage: DBStorage = Depends(get_db)
):
    """Switch the user's active dashboard role.

    The backend will set the stored user role to `both`, ensure the
    requested role's profile document exists, and return success so the
    frontend can navigate to the requested dashboard.
    """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    target_role = (payload or {}).get("role")
    if target_role not in (UserRole.BUYER.value, UserRole.SELLER.value):
        content = api_response(False, "Invalid role requested")
        return JSONResponse(content.to_dict(), 400)

    user_doc = user_response.payload
    user_id = str(user_doc.get("_id"))

    # Persist 'both' role for the user so they can act as both buyer and seller
    update_resp = await storage.update_user_by_id(user_id, role=UserRole.BOTH.value)
    if not update_resp.status:
        content = api_response(False, "Failed to update user role")
        return JSONResponse(content.to_dict(), 500)

    # Ensure the requested profile document exists
    if target_role == UserRole.SELLER.value:
        seller_resp = await storage.get_seller_by_user_id(user_id)
        if not seller_resp.status:
            created = await storage.create_seller_profile(user_id)
            if not created.status:
                content = api_response(False, "Failed to create seller profile")
                return JSONResponse(content.to_dict(), 500)
    else:
        buyer_resp = await storage.get_buyer_by_user_id(user_id)
        if not buyer_resp.status:
            created = await storage.create_buyer_profile(user_id)
            if not created.status:
                content = api_response(False, "Failed to create buyer profile")
                return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Role switch successful", payload={"role": target_role})
    return JSONResponse(content.to_dict())

@user.put("/me/update")
async def update_me(
    first_name: str | None = Form(None),
    last_name: str | None = Form(None),
    phone_number: str | None = Form(None),
    profile_image: UploadFile | None = File(None),
    user_response = Depends(get_user_from_token),
    storage: DBStorage = Depends(get_db)
):
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
    if first_name:
        update_dict["first_name"] = first_name.strip()
    if last_name:
        update_dict["last_name"] = last_name.strip()
    if phone_number:
        update_dict["phone_number"] = phone_number.strip()
        update_dict["phone_number_verified"] = False

    if profile_image:
        # check that the provided image is in the correct format
        if not profile_image.filename.endswith((".jpg", ".jpeg", ".png")):
            content = api_response(False, "The provided image is not in the correct format")
            return JSONResponse(content.to_dict())
        if profile_image.size > 5 * (1024 ** 2):
            content = api_response(False, "The provided image is more than the required size")
            return JSONResponse(content.to_dict())
        if user.get("image_key", ""):
            # delete the image from the s3 bucket
            uploader.delete_object(user["image_key"])
        # add background tasks to upload the image and save the key to the mongo document
        image_key = uploader.upload_profile_image(user.get("_id"), profile_image)
        update_dict["image_key"] = image_key
    
    if len(update_dict.keys()) < 1:
        content = api_response(True, "The neccessary data for the update was not found")
        return JSONResponse(content.to_dict())
    
    update_response = await storage.update_user_by_id(user.get("_id"), **update_dict)
    if not update_response.status:
        content = api_response(False, "The update saved to fail")
    else:
        if update_dict.get("image_key"):
            update_dict["image_url"] = uploader.create_url(update_dict.get("image_key"))
            del update_dict["image_key"]
        content = api_response(True, "The update has completed successfully", update_dict)

    return JSONResponse(content.to_dict())

@user.get("/saved")
async def get_saved_listings(user_response = Depends(get_user_from_token)):
    """Return saved listings (shortlist) for the authenticated user.

    This implementation expects an optional `saved_listings` field on the
    user document which is a list of listing IDs. If none exists an empty
    list is returned.
    """
    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 400)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    user = user_response.payload
    saved_ids = user.get("saved_listings") or []

    results = []
    for lid in saved_ids:
        listing_resp = await storage.get_listing_by_id(lid)
        if listing_resp.status and listing_resp.payload:
            listing = listing_resp.payload
            if listing.get("_id"):
                listing["_id"] = str(listing["_id"])
            if listing.get("seller_id"):
                try:
                    listing["seller_id"] = str(listing["seller_id"])
                except Exception:
                    pass
            results.append(listing)

    content = api_response(True, "Saved listings retrieved", results)
    return JSONResponse(content.to_dict())