""" a module to get and use seller profile routes """

import json
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, List

from database.db_engine import storage
from middlewares.verify_user import get_user_from_token
from models.property_model import ShopListingSchema, LandListingSchema, ApartmentListingSchema
from utils.state_list import States_list, States_with_lgas
from utils.responses import api_response
from services.s3_uploader import uploader

seller = APIRouter(prefix="/seller", tags=["Seller"])

# Mapping of form field names to friendly display names
IMAGE_GROUP_DISPLAY_NAMES = {
    "exterior_images": "Exterior",
    "sitting_room_images": "Sitting Room",
    "bedroom_images": "Bedroom",
    "kitchen_images": "Kitchen",
    "bathroom_images": "Bathroom",
    "other_interior_images": "Other Interior",
    "garden_images": "Garden",
    "gym_images": "Gym",
    "title_document": "Title Document",
    "proof_of_ownership": "Proof of Ownership",
    "tax_clearance_certificate": "Tax Clearance Certificate",
    "approved_building_plan": "Approved Building Plan",
    "structural_integrity_report": "Structural Integrity Report",
    "estate_dues_receipt": "Estate Dues Receipt",
    "occupancy_permit": "Occupancy Permit",
    "utility_bill": "Utility Bill",
}


async def serialize_mongo_value(value):
    """Convert Mongo-specific values into JSON-safe primitives."""

    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        if "url" in value and ("key" in value or "image_type" in value or "image_number" in value):
            resolved_url = await uploader.resolve_accessible_s3_url(value.get("url"), value.get("key"))
            updated_value = dict(value)
            updated_value["url"] = resolved_url
            return {key: await serialize_mongo_value(item) for key, item in updated_value.items()}
        return {key: await serialize_mongo_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [await serialize_mongo_value(item) for item in value]
    return value


async def upload_grouped_files(listing_id: str, group_name: str, files: list[UploadFile]):
    """Upload a list of files to the listing folder and return metadata list.

    Files are named using the convention `groupname_{n}` when multiple files
    are present and `groupname` when only a single file exists for that group.
    """

    uploaded_files = []
    image_type = IMAGE_GROUP_DISPLAY_NAMES.get(group_name, group_name)
    total = len(files) if files is not None else 0

    for index, uploaded_file in enumerate(files, start=1):
        if not uploaded_file:
            continue

        # Name files according to the requested convention
        if total == 1:
            filename_override = group_name
        else:
            filename_override = f"{group_name}_{index}"

        file_response = await uploader.upload_house_image(
            uploaded_file,
            listing_id,
            group_name,
            index,
            filename_override=filename_override,
        )
        if not file_response.status:
            return None

        uploaded_files.append(
            {
                "filename": uploaded_file.filename,
                "content_type": uploaded_file.content_type,
                "url": file_response.payload.get("url"),
                "key": file_response.payload.get("key"),
                "image_type": image_type,
                "image_number": index,
            }
        )

    return uploaded_files


@seller.get("/me")
async def get_my_seller_profile(user_response=Depends(get_user_from_token)):
    """Return the seller profile linked to the authenticated user."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    seller_response = await storage.get_seller_by_user_id(str(user.get("_id")))
    if not seller_response.status:
        content = api_response(False, "Seller profile not found")
        return JSONResponse(content.to_dict(), 401)

    seller_profile = seller_response.payload
    seller_profile = await serialize_mongo_value(seller_profile)

    content = api_response(True, "The seller profile has been retrieved successfully", seller_profile)
    return JSONResponse(content.to_dict())


@seller.put("/profile")
async def update_my_seller_profile(
    first_name: str | None = Form(None),
    last_name: str | None = Form(None),
    phone_number: str | None = Form(None),
    date_of_birth: str | None = Form(None),
    gender: str | None = Form(None),
    residential_address: str | None = Form(None),
    about_me: str | None = Form(None),
    business_type: str | None = Form(None),
    business_address: str | None = Form(None),
    years_of_experience: str | None = Form(None),
    company_name: str | None = Form(None),
    cac_registration_number: str | None = Form(None),
    company_website: str | None = Form(None),
    national_id_type: str | None = Form(None),
    id_number: str | None = Form(None),
    account_name: str | None = Form(None),
    bank_name: str | None = Form(None),
    account_number: str | None = Form(None),
    save_mode: str | None = Form("draft"),
    profile_image: UploadFile | None = File(None),
    proof_of_address: UploadFile | None = File(None),
    id_front: UploadFile | None = File(None),
    id_back: UploadFile | None = File(None),
    user_response=Depends(get_user_from_token),
):
    """Update the authenticated seller profile and the linked user profile."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    user = user_response.payload
    user_id = str(user.get("_id"))

    seller_response = await storage.get_seller_by_user_id(user_id)
    if not seller_response.status:
        await storage.create_seller_profile(user_id)

    user_updates = {}
    if first_name:
        user_updates["first_name"] = first_name.strip()
    if last_name:
        user_updates["last_name"] = last_name.strip()
    if phone_number:
        user_updates["phone_number"] = phone_number.strip()

    if profile_image:
        existing_profile_key = uploader.extract_s3_key_from_url(user.get("image_url")) or user.get("image_key")
        profile_image_response = await uploader.replace_profile_image(profile_image, user_id, existing_profile_key)
        if profile_image_response.status:
            user_updates["image_url"] = profile_image_response.payload.get("url")
            user_updates["image_key"] = profile_image_response.payload.get("key")
            print("An update happened to the profile image", profile_image_response.payload)

    if user_updates:
        await storage.update_user_by_id(user_id, **user_updates)

    seller_updates = {
        "date_of_birth": date_of_birth,
        "gender": gender,
        "residential_address": residential_address,
        "about_me": about_me,
        "business_type": business_type,
        "business_address": business_address,
        "years_of_experience": years_of_experience,
        "company_name": company_name,
        "cac_registration_number": cac_registration_number,
        "company_website": company_website,
        "national_id_type": national_id_type,
        "id_number": id_number,
        "account_name": account_name,
        "bank_name": bank_name,
        "account_number": account_number,
        "status": save_mode or "draft",
    }

    seller_updates = {key: value for key, value in seller_updates.items() if value not in (None, "")}

    if proof_of_address:
        proof_response = await uploader.upload_verification_image(proof_of_address, user_id, "proof-of-address")
        if proof_response.status:
            seller_updates["proof_of_address_url"] = proof_response.payload.get("url")

    if id_front:
        id_front_response = await uploader.upload_verification_image(id_front, user_id, "id-front")
        if id_front_response.status:
            seller_updates["id_front_url"] = id_front_response.payload.get("url")

    if id_back:
        id_back_response = await uploader.upload_verification_image(id_back, user_id, "id-back")
        if id_back_response.status:
            seller_updates["id_back_url"] = id_back_response.payload.get("url")

    seller_updates["updated_at"] = datetime.now()

    if seller_updates:
        await storage.update_seller_by_user_id(user_id, **seller_updates)

    updated_user = await storage.get_user_by_id(user_id)
    updated_seller = await storage.get_seller_by_user_id(user_id)

    payload = {
        "user": await serialize_mongo_value(updated_user.payload if updated_user.status else user),
        "seller": await serialize_mongo_value(updated_seller.payload if updated_seller.status else seller_updates),
    }
    content = api_response(True, "Seller profile updated successfully", payload)
    return JSONResponse(content.to_dict())


@seller.get("/dashboard/stats")
async def get_seller_dashboard_stats(user_response=Depends(get_user_from_token)):
    """Return seller dashboard stats for listings, enquiries, inspections and deals."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    user = user_response.payload
    stats_response = await storage.get_seller_dashboard_stats(str(user.get("_id")))
    if not stats_response.status:
        content = api_response(False, "Failed to retrieve seller dashboard stats")
        return JSONResponse(content.to_dict(), 500)

    content = api_response(True, "Seller dashboard stats retrieved successfully", stats_response.payload)
    return JSONResponse(content.to_dict())


@seller.post("/listings/apartment/submit")
async def submit_apartment_listing(
    background_task: BackgroundTasks,
    property_type: str = Form(...),
    title: str = Form(...),
    price: str = Form(...),
    state: str = Form(...),
    l_g_a: str = Form(...),
    street: str = Form(...),
    building_no: int = Form(...),
    house_no: int | None = Form(...),
    description: str = Form(...),
    year_built: int | None = Form(None),
    number_of_bedrooms: int = Form(0),
    number_of_bathrooms: int = Form(0),
    size_square_meters: int = Form(...),
    other_amenities: List[str] = Form([]),
    is_negotiable: bool = Form(True),
    exterior_image: UploadFile | None = File(None),
    sitting_room_image: UploadFile | None  = File(None),
    bedroom_images: list[UploadFile] = File([]),
    bathroom_images: list[UploadFile] = File([]),
    kitchen_image: UploadFile | None = File(None),
    garden_image: UploadFile | None = File(None),
    gym_image: UploadFile | None = File(None),
    home_video: UploadFile | None = File(None),
    proof_of_ownership: UploadFile = File(...),
    tax_clearance_certificate: UploadFile | None = File(None),
    approved_building_plan: UploadFile | None = File(None),
    estate_dues_receipt: list[UploadFile] = File([]),
    occupancy_permit: UploadFile | None = File(None),
    user_response=Depends(get_user_from_token)
):
    """
    The endpoint to upload an apartment of any type apart from a shop or land to the home buddy database
    Upload listing media to S3, save a listing document, and mark it pending review.
    Args:
        background_tasks: the function to handle tasks that run in the background
        property_type: the type of property to be listed it should be an apartment type
        title: the title for this listing
        price: the price of the apartment to be listed
        state: the state the listing is located in
        l_g_a: the local government area of the listing in the state
        street: the street of the listing in the area
        building_no: the number of the building in the street
        house_no: the house number if the house is in a complex
        description: a brief description of the house and listing
        year_built: the year the building was erected
        number_of_bedrooms: the number of bedrooms in the apartment
        number of bathrooms: the number of bathrooms in the apartment
        size_square_meters: the size of the apartment in square meters
        other_amenities: a list of other amenities the house comes with
        is_negotiable: a bool to know whether the price can be negotiated
        exterior_image: a image of the exterior of the apartment
        sitting_room_image: a image of the sitting room of the apartment
        bedroom_images: a list of images based on the number of bedrooms the apartment has
        bathroom_images: a list of images based on the number of bathrooms in the apartment
        kitchen_image: an image of the kitchen
        garden_image: an image of the garden if there is a garden in the apartment
        gym_image: an image of the gym if there is one present in the apartment
        house_video: a video showing the house in details with a size limit of 50 mb
        proof_of_ownership: proof that the user is the owner of the house
        tax_clearance_certificate: a proof that the apartment owner pays all the needed taxes
        approved_building_plan: a plan showing the government approved blueprint of the house
        structural_integrity_plan: a proof that the house structure is up to standard
        estate_dues_receipt: a list of images showing that all utilities are well paid for and are up to date
        occupancy_permit: a proof that occupants can stay in the apartment
        user_response: authenticated user making the listing
    """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), status_code=401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), status_code=205)

    # get the seller_id for the seller listing the document
    seller_response = await storage.get_seller_by_user_id(user_response.payload.get("_id", ""))
    seller_id = seller_response.payload.get("_id", "") if  seller_response.status else None

    #ensure the endpoint is only accessible by sellers
    if (
        not seller_id and (
            user_response.payload.get("role") not in ["seller", "both"]
        )
    ):
        content = api_response(False, "The user must be a seller")
        return JSONResponse(content.to_dict(), 400)

    if property_type.lower() not in ["flat", "mini flat", "bunglow", "penthouse", "duplex"]:
        content = api_response(False, "This endpoint is for submitting apartments such as duplex and flats")
        return JSONResponse(content.to_dict(), 400)

    # check that the state, LGA, and building address were given in the request body
    if not state or state.lower() not in States_list:
        # handle the fact that the state is not present in nigeria
        content = api_response(False, "The  provided state for this listing is not in Nigeria")
        return JSONResponse(content.to_dict(), 400)
    
    if not l_g_a and l_g_a not in States_with_lgas[state.title()]:
        # handle the fact that the local governemnt area provided is no in the state selected
        content = api_response(False, "The provided government area is not present in state. Select a different one")
        return JSONResponse(content.to_dict(), 400)
    
    if not building_no or not street:
        content = api_response(False, "No building number, street provided for the apartment")
        return JSONResponse(content.to_dict(), 400)

    if not size_square_meters:
        content = api_response(False, "The size of the apartment must be provided")
        return JSONResponse(content.to_dict(), 400)
    
    if not price:
        content = api_response(False, "The price of the listing must be provided")
        return JSONResponse(content.to_dict(), 400)

    # check that all the images provided follow the required pattern of 5MB and are in the correct format
    inspection_means = None
    if exterior_image:
        if not exterior_image.filename.endswith((".jpeg", ".png", ".jpg", ".webp")):
            content = api_response(False, "All images provided must be in either JPEG, PNG or WEBP format")
            return JSONResponse(content.to_dict(), 400)
        if exterior_image.size > 5 * (1024 ** 2):
            content = api_response(False, "The provided image must be less than  5MB")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "image"
    if sitting_room_image:
        if not sitting_room_image.filename.endswith((".jpeg", ".png", ".jpg", ".webp")):
            content = api_response(False, "All images provided must be in either JPEG, PNG or WEBP format")
            return JSONResponse(content.to_dict(), 400)
        if sitting_room_image.size > 5 * (1024 ** 2):
            content = api_response(False, "The provided image must be less than  5MB")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "image"
    if kitchen_image:
        if not kitchen_image.filename.endswith((".jpeg", ".png", ".jpg", ".webp")):
            content = api_response(False, "All images provided must be in either JPEG, PNG or WEBP format")
            return JSONResponse(content.to_dict(), 400)
        if kitchen_image.size > 5 * (1024 ** 2):
            content = api_response(False, "The provided image must be less than  5MB")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "image"
    if garden_image:
        if not garden_image.filename.endswith((".jpeg", ".png", ".jpg", ".webp")):
            content = api_response(False, "All images provided must be in either JPEG, PNG or WEBP format")
            return JSONResponse(content.to_dict(), 400)
        if garden_image.size > 5 * (1024 ** 2):
            content = api_response(False, "The provided image must be less than  5MB")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "image"
    if gym_image:
        if not gym_image.filename.endswith((".jpeg", ".png", ".jpg", ".webp")):
            content = api_response(False, "All images provided must be in either JPEG, PNG or WEBP format")
            return JSONResponse(content.to_dict(), 400)
        if gym_image.size > 5 * (1024 ** 2):
            content = api_response(False, "The provided image must be less than  5MB")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "image"

    if bathroom_images:
        if len(bathroom_images) != number_of_bathrooms:
            content = api_response(False, "provide the correct image number for the number of bathrooms provided")
            return JSONResponse(content.to_dict())
        for image in bathroom_images:
            if not image.filename.endswith((".jpeg", ".png", ".jpg", ".webp")):
                content = api_response(False, "All images provided must be in either JPEG, PNG or WEBP format")
                return  JSONResponse(content.to_dict())
            if image.size > 5 * (1024 ** 2):
                content = api_response(False, "The provided image must be less than 5MB")
                return JSONResponse(content.to_dict())
        inspection_means = "image" if not inspection_means else "image"

    if bedroom_images:
        if len(bedroom_images) != number_of_bedrooms:
            content = api_response(False, "provide the correct image number for the number of bathrooms provided")
            return JSONResponse(content.to_dict())
        for image in bedroom_images:
            if not image.filename.endswith((".jpeg", ".png", ".jpg", ".webp")):
                content = api_response(False, "All images provided must be in either JPEG, PNG or WEBP format")
                return  JSONResponse(content.to_dict())
            if image.size > 5 * (1024 ** 2):
                content = api_response(False, "The provided image must be less than 5MB")
                return JSONResponse(content.to_dict())
        inspection_means = "image" if not inspection_means else "image"

    if home_video:
        if not home_video.filename.endswith(("mp4", ".webm")):
            content = api_response(False, "The video provided is not in the correct format")
            return JSONResponse(content.to_dict(), 400)
        if home_video.size > 50 * (1024 ** 2):
            content = api_response(False, "The provided video is bigger than the required size")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "video" if not inspection_means else "both"

    if not inspection_means:
        content = api_response(False, "Provide the needed media for your property to be successfully listed")
        return JSONResponse(content.to_dict(), 400)

    # check the provided means of listing provided if they are in the correct format and right size
    if not proof_of_ownership:
        content = api_response(False, "The proof of shop ownership must be provided")
        return JSONResponse(content.to_dict(), 400)
    if not proof_of_ownership.filename.endswith((".jpeg", ".jpg", ".png", ".webp", ".pdf")):
        content = api_response(False, "The provided proof of ownership is not in the correct format")
        return JSONResponse(content.to_dict(), 400)
    if proof_of_ownership.size > 5 * (1024 ** 2):
        content = api_response(False, "The proof of ownership size is too large")
        return JSONResponse(content.to_dict(), 400)

    if tax_clearance_certificate:
        if not tax_clearance_certificate.filename.endswith((".jpeg", ".jpg", ".png", ".webp", ".pdf")):
            content = api_response(False, "The provided tax certificate is not in the right format")
            return JSONResponse(content.to_dict(), 400)
        if tax_clearance_certificate.size > 5 * (1024 ** 2):
            content = api_response(False, "The provided tax cetificate file exceeds the required size")
    
    if approved_building_plan:
        if not approved_building_plan.filename.endswith((".jpeg", ".jpg", ".png", ".webp", ".pdf")):
            content = api_response(False, "The provided building plan is not in the right format")
            return JSONResponse(content.to_dict(), 400)
        if approved_building_plan.size > 5 * (1024 ** 2):
            content = api_response(False, "The provided building plan file exceeds the required size")
            return JSONResponse(content.to_dict(), 400)

    if occupancy_permit:
        if not occupancy_permit.filename.endswith((".jpeg", ".jpg", ".png", ".webp", ".pdf")):
            content = api_response(False, "The provided occupancy permit is not in the right format")
            return JSONResponse(content.to_dict(), 400)
        if occupancy_permit.size > 5 * (1024 ** 2):
            content = api_response(False, "The provided occupancy permit file exceeds the required size")
            return JSONResponse(content.to_dict(), 400)

    # check if the estate dues receipt are provided and are in the right format
    if estate_dues_receipt:
        for file in estate_dues_receipt:
            if not file.filename.endswith((".jpeg", ".png", ".jpg", ".webp", ".pdf")):
                content = api_response(False, "All files provided for the apartment dues must be in either JPEG, PNG, PDF or WEBP format")
                return  JSONResponse(content.to_dict())
            if file.size > 5 * (1024 ** 2):
                content = api_response(False, "The provided files for the apartment dues must be less than 5MB")
                return JSONResponse(content.to_dict())

    # all checks completed.....
    # Create a initial listing template to reserve a listng id document

    listing_document = ApartmentListingSchema(
        seller_id=seller_id, title=title, state = state, LGA=l_g_a, street=street, price=price,
        building_number=building_no, house_number=house_no, inspection_means=inspection_means,
        year_built=year_built, property_type=property_type, number_of_bedrooms=number_of_bedrooms,
        number_of_bathrooms=number_of_bathrooms, size_square_meters=size_square_meters, is_negotiable=is_negotiable,
        other_amenities=other_amenities, description=description
    )
    listing_result = await storage.create_listing_submission(listing_document.model_dump())
    if not listing_result.status:
        content = api_response(False, "Failed to save listing submission")
        return JSONResponse(content.to_dict(), 500)
    listing_id = str(listing_result.payload.get("listing_id"))

    apartment_media = {
        "exterior": exterior_image,
        "sitting_room": sitting_room_image,
        "kitchen": kitchen_image,
        "gym": gym_image,
        "garden":garden_image
    }
    bathroom_dict, bedroom_dict, estate_dues_dict = {}, {}, {}
    for a in range(len(bathroom_images)):
        bathroom_dict[f"bathroom_{a + 1}"] = bathroom_images[a]
    for a in range(len(bedroom_images)):
        bedroom_dict[f"bedroom_{a + 1}"] = bedroom_images[a]
    for a in range(len(estate_dues_receipt)):
        estate_dues_dict[f"estate_dues_{a + 1}"] = estate_dues_receipt[a]
    apartment_media.update(bathroom_dict)
    apartment_media.update(bedroom_dict)

    ownership_media = {
        "proof_of_ownership": proof_of_ownership,
        "tax_clearance_certificate": tax_clearance_certificate,
        "approved_building_plan": approved_building_plan,
        "occupancy_permit": occupancy_permit
    }
    ownership_media.update(estate_dues_dict)

    # upload the provided image to the bucket for save keeping
    for key, value in apartment_media.items():
        if not value: continue
        background_task.add_task(uploader.upload_listing_media, listing_id, key, value)
    for key, value in ownership_media.items():
        if not value: continue
        background_task.add_task(uploader.upload_listing_media, listing_id, key, value)

    content = api_response(True, "Listing submitted successfully and is pending admin approval")
    return JSONResponse(content.to_dict())

@seller.post("/listings/shop/submit")
async def submit_shop_listing(
    background_task: BackgroundTasks,
    property_type: str = Form(...),
    title: str = Form(...),
    price: int = Form(...),
    state: str = Form(...),
    l_g_a: str = Form(...),
    street: str = Form(...),
    building_no: int = Form(...),
    shop_no: int | None = Form(...),
    description: str = Form(...),
    bathroom: bool = Form(True),
    is_negotiable: bool = Form(True),
    size_square_meters: str | None = Form(None),
    # this marks the beginning of the images for the shop listing
    exterior_image: UploadFile | None = File(None),
    interior_image: UploadFile | None = File(None),
    exterior_video: UploadFile | None = File(None),
    # this marks the legitimacy of a shop listing
    proof_of_ownership: UploadFile = File(...),
    tax_clearance_certificate: UploadFile | None = File(None),
    structural_integrity_report: UploadFile | None = File(None),
    occupancy_permit: UploadFile | None = File(None),
    user_response=Depends(get_user_from_token),
):
    """
    Upload listing media to S3, save a shop listing, and mark it pending review.
    Args:
        background_task: an argument that adds tasks to the background to run
        title: the title of the listing
        property_type: the type of the property to be listed
        price: the price of the shop to be listed
        state: the state the shop is located in
        l_g_a: the local government area of the shop in the state
        street: the street the shop is located on
        building_no: the number of the complex/building the shop is located
        shop_no: the number of the shop in the complex/building
        description: a brief description of the shop
        bathrooms: a bool showing whether bathrooms are present in the shop
        size_square_meters: the size of the shop in square meters
        exterior_image: a image of the exterior of the shop
        interior_image: a image of the interior of the shop
        exterior_video: a video showing the exterior and interior of a shop
        proof_of_ownership: a proof of the seller ownership of the shop
        tax_clearance_certificate: a image of pdf showing that there is no outstanding tax payment
        structural_integrity_report: a image or pdf of the building reliability to stand and keep standing for a long time
        occupancy_permit: a document showing that after selling my project funds to have it destroyed
        user_response: the authenticated user
    """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 205)

    # get the seller_id for the seller listing the document
    seller_response = await storage.get_seller_by_user_id(user_response.payload.get("_id", ""))
    seller_id = seller_response.payload.get("_id", "") if  seller_response.status else None

    #ensure the endpoint is only accessible by sellers
    if (
        not seller_id and (
            user_response.payload.get("role") not in ["seller", "both"]
        )
    ):
        content = api_response(False, "The user must be a seller")
        return JSONResponse(content.to_dict(), 400)

    # This endpoint handles the listing of shops only so ensure that the listing type is a shop
    if property_type.lower() != "shop":
        content = api_response(False, "This endpoint is for submitting shop listings only")
        return JSONResponse(content.to_dict(), 400)
    
    # check that the state, LGA, and building address were given in the request body
    if not state or state.lower() not in States_list:
        # handle the fact that the state is not present in nigeria
        content = api_response(False, "The  provided state for this listing is not in Nigeria")
        return JSONResponse(content.to_dict(), 400)
    
    if not l_g_a and l_g_a not in States_with_lgas[state.title()]:
        # handle the fact that the local governemnt area provided is no in the state selected
        content = api_response(False, "The provided government area is not present in state. Select a different one")
        return JSONResponse(content.to_dict(), 400)
    
    if not building_no or not street or not shop_no:
        content = api_response(False, "No building number, street or shop number provided for the shop")
        return JSONResponse(content.to_dict(), 400)
    
    if not size_square_meters:
        content = api_response(False, "The size of the shop must be provided")
        return JSONResponse(content.to_dict(), 400)

    inspection_means = None  # this checks whether image of video is used to virtually inspect the listing
    
    # if an image is provided handle theimage size and name
    if exterior_image or interior_image:
        if (
            not exterior_image.filename.endswith((".jpeg", ".png", ".jpg", ".webp")) or
            not interior_image.filename.endswith((".jpeg", ".png", ".jpg", ".webp"))
        ):
            content = api_response(False, "The exterior and interior images must be in JPEG, PNG, JPG, or WEBP format")
            return JSONResponse(content.to_dict(), 400)
        # check for image size
        if exterior_image.size > 5 * (1024 ** 2) or interior_image.size > 5 * (1024 ** 2):
            content = api_response(False,"The image size is greater than the required size")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "image"

    # if a video is provided handle the video name and size
    if exterior_video:
        if not exterior_video.filename.endswith((".mp4", ".webm")) and not exterior_video.content_type.startswith("video/"):
            content = api_response(False, "The video provided is not in the right format")
            return JSONResponse(content.to_dict(), 400)
        if exterior_video.size > 50 * (1024 ** 2):
            content = api_response(False, "The video size is more than the required size")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "both" if inspection_means else "video"
    
    if not inspection_means:
        content = api_response(False, "Provide the needed media for your property to be successfully listed")
        return JSONResponse(content.to_dict(), 400)

    # check that the provided media for the listing verification are provided and in the correct format
    if not proof_of_ownership:
        content = api_response(False, "The proof of shop ownership must be provided")
        return JSONResponse(content.to_dict(), 400)
    if not proof_of_ownership.filename.endswith((".jpeg", ".jpg", ".png", ".webp", ".pdf")):
        content = api_response(False, "The provided proof of ownership is not in the correct format")
        return JSONResponse(content.to_dict(), 400)
    if proof_of_ownership.size > 5 * (1024 ** 2):
        content = api_response(False, "The proof of ownership size is too large")
        return JSONResponse(content.to_dict(), 400)

    if tax_clearance_certificate:
        if not tax_clearance_certificate.filename.endswith((".jpeg", ".jpg", ".png", ".webp", ".pdf")):
            content = api_response(False, "The provided tax clearance certificate is not in the correct format")
            return JSONResponse(content.to_dict(), 400)
        if tax_clearance_certificate.size > 5 * (1024 ** 2):
            content = api_response(False, "The tax clearance certificate size is too large")
            return JSONResponse(content.to_dict(), 400)
    
    if structural_integrity_report:
        if not structural_integrity_report.filename.endswith((".jpeg", ".jpg", ".png", ".webp", ".pdf")):
            content = api_response(False, "The provided structural integrity report is not in the correct format")
            return JSONResponse(content.to_dict(), 400)
        if structural_integrity_report.size > 5 * (1024 ** 2):
            content = api_response(False, "The structural integrity report size is too large")
            return JSONResponse(content.to_dict(), 400)

    if occupancy_permit:
        if not occupancy_permit.filename.endswith((".jpeg", ".jpg", ".png", ".webp", ".pdf")):
            content = api_response(False, "The occupancy permit is not in the correct format")
            return JSONResponse(content.to_dict(), 400)
        if occupancy_permit.size > 5 * (1024 ** 2):
            content = api_response(False, "The occupancy permit size is too large")
            return JSONResponse(content.to_dict(), 400)

    # Create initial listing record to reserve a listing id document
    listing_document = ShopListingSchema(
        seller_id=seller_id, title=title, price=price, state=state, is_negotiable=is_negotiable,
        LGA=l_g_a, street=street, building_number=building_no, shop_number=shop_no, bathroom=bathroom,
        description=description, inspection_means=inspection_means, size_square_meters=size_square_meters 
    )

    listing_result = await storage.create_listing_submission(listing_document.model_dump())
    if not listing_result.status:
        content = api_response(False, "Failed to save listing submission")
        return JSONResponse(content.to_dict(), 500)
    listing_id = str(listing_result.payload.get("listing_id"))

    # create a directoy with the listing id of the new images and videos to be saved
    shop_media: Dict = {
        "shop_interior": interior_image,
        "shop_exterior": exterior_image,
        "shop_video": exterior_video
    }

    ownership_media: Dict = {
        "proof_of_ownership": proof_of_ownership,   # must be provided
        "tax_clearance_certificate": tax_clearance_certificate if tax_clearance_certificate else None,
        "structural_integrity_report": structural_integrity_report if structural_integrity_report else None,
        "occupancy_permit": occupancy_permit if occupancy_permit else None
    }

    # upload the provided image to the bucket for save keeping
    for key, value in shop_media.items():
        if not value: continue
        background_task.add_task(uploader.upload_listing_media, listing_id, key, value)
    for key, value in ownership_media.items():
        if not value: continue
        background_task.add_task(uploader.upload_listing_media, listing_id, key, value)

    content = api_response(True, "Listing submitted successfully")
    return JSONResponse(content.to_dict())

@seller.post("/listings/land/submit")
async def submit_land_listing(
    background_tasks: BackgroundTasks,
    property_type: str = Form(...),
    title: str = Form(...),
    price: int = Form(...),
    description: str = Form(...),
    state: str = Form(...),
    l_g_a: str = Form(...),
    street: str = Form(...),
    building_no: int = Form(...),
    size_square_meters: str = Form(...),
    is_negotiable: bool = Form(True),
    # this defines the needed images for land verification
    land_image: UploadFile | None = File(None),
    land_video: UploadFile | None = File(None),
    proof_of_ownership: UploadFile | None = File(None),
    user_response=Depends(get_user_from_token),
):
    """
    Endpoint to submit a land listing for admin approval by a seller
    Upload land listing media to S3, save a listing document, and mark it pending review.
    Args:
        background_task: an argument that adds tasks to the background to run
        title: the title of the listing
        property_type: the type of the property to be listed
        price: the price of the shop to be listed
        state: the state the shop is located in
        l_g_a: the local government area of the shop in the state
        street: the street the shop is located on
        building_no: the number of the complex/building the shop is located
        description: a brief description of the shop
        size_square_meters: the size of the shop in square meters
        land_image: a image of the land
        land_video: a video showing the land
        proof_of_ownership: a proof of the seller ownership of the shop
        user_response: the authenticated user
    """

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), status_code=401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), status_code=205)
    
    # get the seller_id for the seller listing the document
    seller_response = await storage.get_seller_by_user_id(user_response.payload.get("_id", ""))
    seller_id = seller_response.payload.get("_id", "") if  seller_response.status else None

    #ensure the endpoint is only accessible by sellers
    if (
        not seller_id and (
            user_response.payload.get("role") not in ["seller", "both"]
        )
    ):
        content = api_response(False, "The user must be a seller")
        return JSONResponse(content.to_dict(), 400)

     # This endpoint handles the listing of lands only so ensure that the listing type is a land
    if property_type.lower() != "land":
        content = api_response(False, "This endpoint is for submitting shop listings only")
        return JSONResponse(content.to_dict(), 400)
    
    # check that the state, LGA, and building address were given in the request body
    if not state or state.lower() not in States_list:
        # handle the fact that the state is not present in nigeria
        content = api_response(False, "The  provided state for this listing is not in Nigeria")
        return JSONResponse(content.to_dict(), 400)
    
    if not l_g_a and l_g_a not in States_with_lgas[state.title()]:
        # handle the fact that the local governemnt area provided is no in the state selected
        content = api_response(False, "The provided government area is not present in state. Select a different one")
        return JSONResponse(content.to_dict(), 400)
    
    if not building_no or not street:
        content = api_response(False, "No street, building number is provided for the shop")
        return JSONResponse(content.to_dict(), 400)
    
    if not size_square_meters:
        content = api_response(False, "The size of the land must be provided")
        return JSONResponse(content.to_dict(), 400)
    
    inspection_means = None  # this checks whether image of video is used to virtually inspect the listing

     # if an image is provided handle theimage size and name
    if land_image:
        if not land_image.filename.endswith((".jpeg", ".png", ".jpg", ".webp")):
            content = api_response(False, "The land images must be in JPEG, PNG, JPG, or WEBP format")
            return JSONResponse(content.to_dict(), 400)
        # check for image size
        if land_image.size > 5 * (1024 ** 2):
            content = api_response(False,"The image size is greater than the required size")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "image"

    # if a video is provided handle the video name and size
    if land_video:
        if not land_video.filename.endswith((".mp4", ".webm")) and not land_video.content_type.startswith("video/"):
            content = api_response(False, "The video provided is not in the right format")
            return JSONResponse(content.to_dict(), 400)
        if land_video.size > 50 * (1024 ** 2):
            content = api_response(False, "The video size is more than the required size")
            return JSONResponse(content.to_dict(), 400)
        inspection_means = "both" if inspection_means else "video"

    if not inspection_means:
        content = api_response(False, "Provide the needed media for your property to be successfully listed")
        return JSONResponse(content.to_dict(), 400)

    # check that the provided media for the listing verification are provided and in the correct format
    if not proof_of_ownership:
        content = api_response(False, "The proof of land ownership must be provided")
        return JSONResponse(content.to_dict(), 400)
    if not proof_of_ownership.filename.endswith((".jpeg", ".jpg", ".png", ".webp", ".pdf")):
        content = api_response(False, "The provided proof of ownership is not in the correct format")
        return JSONResponse(content.to_dict(), 400)
    if proof_of_ownership.size > 5 * (1024 ** 2):
        content = api_response(False, "The proof of ownership size is too large")
        return JSONResponse(content.to_dict(), 400)

    # Create initial listing record to reserve a listing id document
    listing_document = LandListingSchema(
        seller_id=seller_id, title=title, price=price, state=state, is_negotiable=is_negotiable, LGA=l_g_a, street=street,
        building_number=building_no, description=description, inspection_means=inspection_means, size_square_meters=size_square_meters
    )

    listing_result = await storage.create_listing_submission(listing_document.model_dump())
    if not listing_result.status:
        content = api_response(False, "Failed to save listing submission")
        return JSONResponse(content.to_dict(), 500)
    listing_id = str(listing_result.payload.get("listing_id"))

    # create a dictionary and set set the background tasks to upload images
    land_media = {"proof_of_ownership": proof_of_ownership, "land_image": land_image, "land_video": land_video}
    for key, value in land_media.items():
        if not value: continue
        background_tasks.add_task(uploader.upload_listing_media, listing_id, key, value)

    content = api_response(True, "Land Listing submitted successfully and is pending admin approval")
    return JSONResponse(content.to_dict())


@seller.get("/listings")
async def get_my_listings(user_response=Depends(get_user_from_token)):
    """Retrieve all listings for the authenticated seller."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    seller_id = str(user.get("_id"))

    listings_response = await storage.get_seller_listings(seller_id)
    if not listings_response.status:
        content = api_response(False, "Failed to retrieve listings")
        return JSONResponse(content.to_dict(), 500)

    listings = listings_response.payload
    serialized_listings = [await serialize_mongo_value(listing) for listing in listings]

    content = api_response(True, "Listings retrieved successfully", serialized_listings)
    return JSONResponse(content.to_dict())


# @seller.get("/listings/{listing_id}")
# async def get_listing_detail(listing_id: str, user_response=Depends(get_user_from_token)):
#     """Retrieve details of a specific listing."""

#     if not user_response.status:
#         content = api_response(False, "The access token provided is not valid")
#         return JSONResponse(content.to_dict(), 205)

#     if not user_response.payload:
#         content = api_response(False, "The access token is expired, refresh and try again")
#         return JSONResponse(content.to_dict(), 401)

#     user = user_response.payload
#     seller_id = str(user.get("_id"))

#     listing_response = await storage.get_listing_by_id(listing_id)
#     if not listing_response.status or not listing_response.payload:
#         content = api_response(False, "Listing not found")
#         return JSONResponse(content.to_dict(), 404)

#     listing = listing_response.payload

#     # Verify the listing belongs to this seller
#     if str(listing.get("seller_id")) != seller_id and str(listing.get("seller_id", {}).get("$oid")) != seller_id:
#         content = api_response(False, "You do not have access to this listing")
#         return JSONResponse(content.to_dict(), 403)

#     serialized_listing = await serialize_mongo_value(listing)

#     content = api_response(True, "Listing retrieved successfully", serialized_listing)
#     return JSONResponse(content.to_dict())