"""A module to clean the api response and return a valid dictionary"""

import json
from bson import ObjectId
from datetime import datetime

from models.responses import APIResponse

async def clean_api_response(response: APIResponse):
    """ a function to clean a response payload and return the json serialized form of the content
    
    Args:
        response (APIResponse): the api response to be serialized
    """

    if response.status == False or not response.payload:
        return response.to_dict()
    
    print(response.payload)
    for key, value in response.payload.items():
        # check if the object is a datetime object
        if isinstance(value, datetime):
            response.payload[key] = value.strftime("%Y/%m/%d::%H/%M/%S")
            print(response.payload[key])
    return {}