"""a module to define the buyer route for the buyer to update his recommended settings"""

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from database.get_db import get_db
from database.db_engine import DBStorage
from models.buyer_model import Buyer
from middlewares.verify_user import get_user_from_token
from utils.responses import api_response
from utils.state_list import States_list, States_with_lgas


buyer = APIRouter(prefix="/buyer", tags=["Buyers"], dependencies=[Depends(get_user_from_token)])

@buyer.post("/recommended/listings/settings")
async def update_recommended_listings_settings(
    buyer: Buyer,
    user_response = Depends(get_user_from_token),
    storage: DBStorage = Depends(get_db)
):
    """ a function to update the recommended listings settings of the buyer """

    if not user_response.status:
        content = api_response(False, "Unauthenticated user detected")
        return JSONResponse(content.to_dict(), 401)
    if not user_response.payload:
        content = api_response(False, "Refresh the access token")
        return JSONResponse(content.to_dict(), 205)
    
    # save the buyers recommended settings to the buyers database document
    if not buyer.state.lower() in States_list:
        content = api_response(False, "The provided state is not in the avalable states in nigeria")
        return JSONResponse(content.to_dict(), 400)
    if buyer.LGA.title() not in States_with_lgas[buyer.state.title()]:
        content = api_response(False, "the local government area is not in the provided state")
        return JSONResponse(content.to_dict(), 400)

    if buyer.min_price < 0 or buyer.max_price < 0 or buyer.min_size < 0 or buyer.max_price < 0:
        content = api_response(False, "The provided price and sizes must not be negative")
        return JSONResponse(content.to_dict(), 400)
    if buyer.max_price <= buyer.min_price:
        content = api_response(False, "The maximum price must be greater than the minimum price")
        return JSONResponse(content.to_dict(), 400)
    if buyer.max_size <= buyer.min_size:
        content = api_response(False, "The maximum size must be greater than the minimum size")
        return JSONResponse(content.to_dict(), 400)
    if buyer.property_type.lower() not in ["shop", "land", "flat", "mini flat", "bunglow", "penthouse", "duplex"]:
        content = api_response(False, "The property type is not available")
        return JSONResponse(content.to_dict())
    
    buyer_response = await storage.save_buyer_listing_recommendation(user_response.payload.get("_id"), buyer.model_dump())

    if buyer_response.status:
        content = api_response(True, "The recommended listings settings have been saved successfully")
        return JSONResponse(content.to_dict())
    else:
        content = api_response(False, "The buyers recommended settings is not saved successfully")
        return JSONResponse(content.to_dict(), 400)
        

@buyer.put("/recommended/listings/settings")
async def update_recommended_listings_settings(
    buyer: Buyer,
    user_response = Depends(get_user_from_token),
    storage: DBStorage = Depends(get_db)
):
    """a function to update the user recommended settings
    Args:
        buyer: the buyer recommended setting from the request body
    """

    if not user_response.status:
        content = api_response(False, "Unauthenticated user detected")
        return JSONResponse(content.to_dict(), 401)
    if not user_response.payload:
        content = api_response(False, "Refresh the access token")
        return JSONResponse(content.to_dict(), 205)

    buyer_listing_response = await storage.get_buyer_recommendation_settings(user_response.payload.get("_id"))
    if not buyer_listing_response.status:
        content = api_response(False, "create a recommended settings list before making any changes to it")
        return JSONResponse(content.to_dict(), 400)

    # create a dictionary of the buyer information to update
    buyer_dict, old_buyer_dict = buyer.model_dump(), buyer_listing_response.payload

    if buyer_dict.get("state", None):
        if not buyer.state.lower() in States_list:
            content = api_response(False, "The provided state is not in the avalable states in nigeria")
            return JSONResponse(content.to_dict(), 400)
        if buyer_dict.get("LGA"):
            if buyer.LGA.title() not in States_with_lgas[buyer.state.title()]:
                content = api_response(False, "the local government area is not in the provided state")
                return JSONResponse(content.to_dict(), 400)
        else:
            if old_buyer_dict["LGA"] not in States_with_lgas[buyer.state.title()]:
                content = api_response(False, "the old local government area is not in the provided state provide a new one")
                return JSONResponse(content.to_dict(), 400)

    if buyer_dict.get("property_type", None):
        if buyer_dict["property_type"] not in ["shop", "land", "flat", "mini flat", "bunglow", "penthouse", "duplex"]:
            content = api_response(False, "The property type is not available")
            return JSONResponse(content.to_dict(), 400)

    if buyer_dict.get("max_size", None):
        if buyer_dict.get("min_size"):
            if buyer_dict["max_size"] <= buyer_dict["min_size"]:
                content = api_response(False, "The maximum size must be greater than the minimum size")
                return JSONResponse(content.to_dict(), 400)
        elif buyer_dict["max_size"] <= old_buyer_dict["min_size"]:
            content = api_response(False, "The maximum size must be greater than the old minimum size")
            return JSONResponse(content.to_dict(), 400)

    if buyer_dict.get("min_size", None):
        if buyer_dict.get("max_size"):
            if buyer_dict["max_size"] <= buyer_dict["min_size"]:
                content = api_response(False, "The maximum size must be greater than the minimum size")
                return JSONResponse(content.to_dict(), 400)
        elif old_buyer_dict["max_size"] <= buyer_dict["min_size"]:
            content = api_response(False, "The maximum size must be greater than the old minimum size")
            return JSONResponse(content.to_dict(), 400)

    if buyer_dict.get("max_price", None):
        if buyer_dict.get("min_price"):
            if buyer_dict["max_price"] <= buyer_dict["min_price"]:
                content = api_response(False, "The maximum price must be greater than the minimum price")
                return JSONResponse(content.to_dict(), 400)
        elif buyer_dict["max_price"] <= old_buyer_dict["min_price"]:
            content = api_response(False, "The maximum price must be greater than the old minimum price")
            return JSONResponse(content.to_dict(), 400)

    if buyer_dict.get("min_price", None):
        if buyer_dict.get("max_price"):
            if buyer_dict["max_price"] <= buyer_dict["min_price"]:
                content = api_response(False, "The maximum price must be greater than the minimum price")
                return JSONResponse(content.to_dict(), 400)
        elif old_buyer_dict["max_price"] <= buyer_dict["min_price"]:
            content = api_response(False, "The maximum price must be greater than the old minimum price")
            return JSONResponse(content.to_dict(), 400)
    
    # get the information to update in the database
    update_dict = {}
    for key, value in buyer_dict.items():
        if value:
            update_dict[key] = value
    
    update_response = await storage.update_buyer_listing_recommendation(old_buyer_dict.get("_id"), update_dict)
    content = api_response(True, "The update has completed") if update_response.status else api_response(False, "The update has failed")
    return JSONResponse(content.to_dict())

@buyer.get("/recommended/listings/settings")
async def get_recommended_listings_settings(
    user_response = Depends(get_user_from_token),
    storage: DBStorage = Depends(get_db)
):
    """ a function to get the recommended listings settings of the buyer """

    if not user_response.status:
        content = api_response(False, "Unauthenticated user detected", None)
        return JSONResponse(content.to_dict(), 401)
    if not user_response.payload:
        content = api_response(False, "Refresh the access token")
        return JSONResponse(content.to_dict(), 205)

    # get the settings for the user from the database
    settings_response = await storage.get_buyer_recommendation_settings(user_response.payload.get("_id", None))

    if not settings_response.status:
        content = api_response(False, "An error occured when getting the recommended settings create a new one or update the former one")
    else:
        content = api_response(True, "The recommended listings settings have been retrieved successfully", settings_response.payload or None)
    return JSONResponse(content.to_dict())

@buyer.get("/recommended")
async def get_recommended_listings(
    user_response = Depends(get_user_from_token),
    storage: DBStorage = Depends(get_db)
):
    """ a function to get the recommended listings for the buyer based on his recommended settings"""

    if not user_response.status:
        content = api_response(False, "Unauthenticated user detected", None)
        return JSONResponse(content.to_dict(), 401)
    if not user_response.payload:
        content = api_response(False, "Refresh the access token")
        return JSONResponse(content.to_dict(), 205)

    # get the recommended listings settings for the buyer from the database
    settings_response = await storage.get_buyer_recommendation_settings(user_response.payload.get("_id"))
    if not settings_response.status or not settings_response.payload:
        content = api_response(False, "Create a recommendation setting for your house listing")
        return JSONResponse(content.to_dict())
    recommended_listings_response = await storage.get_recommended_listings(settings_response.payload)
    return

    if not recommended_listings_response.status:
        content = api_response(False, "An error occured when getting the recommended listings create a new one or update the former one")
    else:
        content = api_response(True, "The recommended listings have been retrieved successfully", recommended_listings_response.payload or None)
    return JSONResponse(content.to_dict())