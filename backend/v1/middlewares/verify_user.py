""" a module to define a middle ware which gets the user from the database"""

from fastapi import Request

from database.db_engine import storage
from utils.cookie_token import token_manager
from utils.responses import function_response

async def get_user_from_token(request: Request):
    """ a method to get the user from the access token passed to the frontend """


    access_token = request.cookies.get("access_token")
    print(access_token, "The access token from the cookie")

    user_response = await token_manager.verify_access_token(access_token)
    print(user_response, "The user response from the token manager")
    return user_response


async def get_admin_from_token(request: Request):
    """Get the authenticated admin document from the access token."""

    access_token = request.cookies.get("access_token")
    token_response = await token_manager.verify_access_token(access_token, False)

    return token_response
