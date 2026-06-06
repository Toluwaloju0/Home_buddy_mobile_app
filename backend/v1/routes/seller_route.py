""" a module to get and use seller profile routes """

import json
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import JSONResponse

from database.db_engine import storage
from middlewares.verify_user import get_user_from_token
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


@seller.post("/listings/submit")
async def submit_listing(
    title: str = Form(...),
    category: str = Form(...),
    price: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    year_built: str | None = Form(None),
    property_type: str | None = Form(None),
    number_of_bedrooms: str | None = Form(None),
    number_of_bathrooms: str | None = Form(None),
    size_square_meters: str | None = Form(None),
    full_address: str | None = Form(None),
    listing_plan: str | None = Form(None),
    title_document: UploadFile | None = File(None),
    proof_of_ownership: UploadFile | None = File(None),
    tax_clearance_certificate: UploadFile | None = File(None),
    approved_building_plan: UploadFile | None = File(None),
    structural_integrity_report: UploadFile | None = File(None),
    estate_dues_receipt: UploadFile | None = File(None),
    occupancy_permit: UploadFile | None = File(None),
    utility_bill: UploadFile | None = File(None),
    exterior_images: list[UploadFile] = File([]),
    sitting_room_images: list[UploadFile] = File([]),
    bedroom_images: list[UploadFile] = File([]),
    kitchen_images: list[UploadFile] = File([]),
    bathroom_images: list[UploadFile] = File([]),
    other_interior_images: list[UploadFile] = File([]),
    garden_images: list[UploadFile] = File([]),
    gym_images: list[UploadFile] = File([]),
    user_response=Depends(get_user_from_token),
):
    """Upload listing media to S3, save a listing document, and mark it pending review."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), status_code=401)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), status_code=401)

    user = user_response.payload
    seller_id = str(user.get("_id"))

    if category == "apartment":
        required_files = {
            "title_document": title_document,
            "proof_of_ownership": proof_of_ownership,
            "exterior_images": exterior_images,
            "sitting_room_images": sitting_room_images,
            "bedroom_images": bedroom_images,
            "kitchen_images": kitchen_images,
            "bathroom_images": bathroom_images,
        }
        missing_required = [name for name, value in required_files.items() if not value]
        if missing_required:
            content = api_response(False, f"Missing required apartment assets: {', '.join(missing_required)}")
            return JSONResponse(content.to_dict(), 400)

    # Create initial listing record to reserve a listing id / folder
    listing_document = {
        "seller_id": seller_id,
        "title": title,
        "category": category,
        "price": price,
        "location": location,
        "description": description,
        "year_built": year_built,
        "property_type": property_type,
        "number_of_bedrooms": number_of_bedrooms,
        "number_of_bathrooms": number_of_bathrooms,
        "size_square_meters": size_square_meters,
        "full_address": full_address,
        "listing_plan": listing_plan,
        "media": {},
        "status": "pending_approval",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
    }

    listing_result = await storage.create_listing_submission(listing_document)
    if not listing_result.status:
        content = api_response(False, "Failed to save listing submission")
        return JSONResponse(content.to_dict(), 500)

    listing_id = str(listing_result.payload.get("listing_id"))

    media_groups = {
        "title_document": [title_document] if title_document else [],
        "proof_of_ownership": [proof_of_ownership] if proof_of_ownership else [],
        "tax_clearance_certificate": [tax_clearance_certificate] if tax_clearance_certificate else [],
        "approved_building_plan": [approved_building_plan] if approved_building_plan else [],
        "structural_integrity_report": [structural_integrity_report] if structural_integrity_report else [],
        "estate_dues_receipt": [estate_dues_receipt] if estate_dues_receipt else [],
        "occupancy_permit": [occupancy_permit] if occupancy_permit else [],
        "utility_bill": [utility_bill] if utility_bill else [],
        "exterior_images": exterior_images,
        "sitting_room_images": sitting_room_images,
        "bedroom_images": bedroom_images,
        "kitchen_images": kitchen_images,
        "bathroom_images": bathroom_images,
        "other_interior_images": other_interior_images,
        "garden_images": garden_images,
        "gym_images": gym_images,
    }

    uploaded_media = {}
    for group_name, group_files in media_groups.items():
        if not group_files:
            continue

        uploaded_group = await upload_grouped_files(listing_id, group_name, group_files)
        if uploaded_group is None:
            content = api_response(False, f"Failed to upload {group_name}")
            return JSONResponse(content.to_dict(), 500)

        uploaded_media[group_name] = uploaded_group

    # Save media metadata and folder URL to the listing record
    folder_url = uploader.get_listing_folder_url(listing_id)
    await storage.update_listing_by_id(listing_id, media=uploaded_media, s3_folder_url=folder_url, updated_at=datetime.now())

    # Retrieve the updated listing for the response
    updated_listing = await storage.get_listing_by_id(listing_id)
    payload = await serialize_mongo_value(updated_listing.payload if updated_listing.status else {**listing_document, "listing_id": listing_id})

    content = api_response(True, "Listing submitted successfully and is pending admin approval", payload)
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


@seller.get("/listings/{listing_id}")
async def get_listing_detail(listing_id: str, user_response=Depends(get_user_from_token)):
    """Retrieve details of a specific listing."""

    if not user_response.status:
        content = api_response(False, "The access token provided is not valid")
        return JSONResponse(content.to_dict(), 205)

    if not user_response.payload:
        content = api_response(False, "The access token is expired, refresh and try again")
        return JSONResponse(content.to_dict(), 401)

    user = user_response.payload
    seller_id = str(user.get("_id"))

    listing_response = await storage.get_listing_by_id(listing_id)
    if not listing_response.status or not listing_response.payload:
        content = api_response(False, "Listing not found")
        return JSONResponse(content.to_dict(), 404)

    listing = listing_response.payload

    # Verify the listing belongs to this seller
    if str(listing.get("seller_id")) != seller_id and str(listing.get("seller_id", {}).get("$oid")) != seller_id:
        content = api_response(False, "You do not have access to this listing")
        return JSONResponse(content.to_dict(), 403)

    serialized_listing = await serialize_mongo_value(listing)

    content = api_response(True, "Listing retrieved successfully", serialized_listing)
    return JSONResponse(content.to_dict())