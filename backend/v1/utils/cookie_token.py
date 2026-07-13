""" a module to get and save tokens to be used as access and refresh tokens"""

import jwt
from datetime import datetime, timedelta

from models.refresh_token_model import RefreshToken
from utils.responses import function_response
from database.db_engine import storage
from utils.settings import settings

class Token:
    """The token class for all my token activities"""

    def __init__(self):
        """ the initializer for the class"""
        self.__access_secret = settings.jwt_access_key
        self.__refresh_secret = settings.jwt_refresh_key

    async def create_access_token(self, user_id):
        """ a method to create the access token for the user
        Args:
            user_id (ObjectId): the user id of the user which would be used in the token creation
        Return the token as part of the response
        """

        token = jwt.encode({
            "user_id": str(user_id),
            # "iat": datetime.now(),
            "exp": datetime.now() + timedelta(minutes=5)
        }, self.__access_secret, algorithm="HS256")

        return function_response(True, {"access_token": token})
    
    async def verify_access_token(self, access_token, is_user=True):
        """
        a method to verify the access token
        Args:
            access_token (str): the access token to verify
        Return a response containing the user object from the database
        """

        if access_token is None:
            return function_response(False)

        try:
            payload = jwt.decode(access_token, self.__access_secret, algorithms="HS256")
            user_id = payload.get("user_id")
            get_user_response = await storage.get_user_by_id(user_id) if is_user else await storage.get_admin_by_id(user_id)
            return get_user_response
        except jwt.ExpiredSignatureError:
            return function_response(True)
        
    async def create_refresh_token(self, user_id: str):
        """ a method to create the refresh token
        Args:
            email: the email associated with the token
        """

        token = jwt.encode({
            "iat": datetime.now(),
            "exp": datetime.now() + timedelta(seconds=30)
        }, self.__refresh_secret, algorithm="HS256")
        # create the refresh token class before saving it to the database
        refresh_object = RefreshToken(token, user_id)
        save_token_response = await storage.save_refresh_token(refresh_object.to_dict())
        if save_token_response.status:
            return function_response(True, {"refresh_token": token})
        return save_token_response
    
    async def verify_refresh_token(self, token: str, is_user: bool = True):
        """ a method to verify the refresh token passed to the user
        Args:
            token (str): the token to be used to refresh the user status
            is_user (bool): a boolean value for a normal user or an admin user
        Return the user email as part of the response
        """

        if token is None:
            return function_response(False)

        user_id_response = await storage.get_refresh_token(token) if is_user else await storage.get_admin_by_id(token)
        return user_id_response

token_manager = Token()