""" a module to create a class which handles all the reset token activities """

import asyncio
import secrets
import random
from bson import ObjectId

from models.reset_password_model import PasswordReset
from utils.create_reset_token import hash_token

class ResetPassword:
    """ The reset password service class"""

    @staticmethod
    async def create_reset_token(user_id):
        """ a function to create the user password reset token and safe it to the database
        Args:
            user_id: the user id of the user whose password is to be reset
        """

        # add a check to ensure that the token is not sent more than 3 times within a 30 minutes time frame
        from database.db_engine import DBStorage
        storage = DBStorage()

        reset_object_response = await storage.get_reset_object_by_user_id(user_id)
        if reset_object_response.payload:
            if reset_object_response.payload.get("count") > 2:
                return False

        count = reset_object_response.payload.get("count", 0) + 1 if reset_object_response.status else 0

        # create a random number and create a token using the random number
        random_int = random.randint(0, 99)
        token = secrets.token_urlsafe(random_int)

        token_hash = hash_token(token)

        # save the hash and the user_id to the database
        password_reset = PasswordReset(count=count, user_id=ObjectId(user_id), token=token_hash)
        await storage.save_reset_password_object(password_reset.model_dump())

        return token

    @staticmethod
    async def compare_token(token):
        """ A method to compare the value of the token provided by the user with the one in the database """

        # hash the provided token then find it in the database
        from database.db_engine import DBStorage
        storage = DBStorage()

        reset_object = await storage.get_reset_object(hash_token(token))
        return reset_object.payload if reset_object.status else False
