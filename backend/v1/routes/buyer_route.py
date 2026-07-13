"""a module to define the buyer route for the buyer to update his recommended settings"""

from bson import ObjectId
from fastapi import APIRouter, Depends, File, Form, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Dict, List

from middlewares.verify_user import get_user_from_token


buyer = APIRouter(prefix="/buyer", tags=["Buyers"], dependencies=[Depends(get_user_from_token)])

@buyer.get("/recommended/listings/settings")
async def get_recommended_listings_settings(
    user_response = Depends(get_user_from_token),
):
    """ a function to get the recommended listings settings of the buyer """

    if not user_response.status:
        content = api_response(False, "The user could not be retrieved", None)
        return JSONResponse(content.to_dict(), 205)

    user = user_response.payload
    recommended_settings = user.get("recommended_listings_settings", {})
    content = api_response(True, "The recommended listings settings have been retrieved successfully", recommended_settings)
    return JSONResponse(content.to_dict())