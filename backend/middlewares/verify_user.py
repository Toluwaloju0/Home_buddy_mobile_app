""" a module to define a middle ware which gets the user from the database"""

from fastapi import Request

from utils.cookie_token import token_manager
from utils.responses import function_response

def get_user_from_token(request: Request):
    """ a method to get the user from the access token passed to the frontend """

    access_token = request.cookies.get("access_token")

    user_response = token_manager.verify_access_token(access_token)
    return user_response