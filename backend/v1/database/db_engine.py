""" a module to define the database class for all database activities on the application """

from typing import Dict
from bson import ObjectId
from argon2.exceptions import VerifyMismatchError
from pymongo import MongoClient

from utils.responses import function_response
from utils.password_hasher import ph

class DBStorage:
    """The db storage class"""

    def __init__(self):
        """The initializer for the storage class"""

        self.__client = MongoClient()
        self.__db = self.__client["Home_Buddy"]
        self.__user = self.__db["users"]
        self.__refresh_token = self.__db["refresh_token"]
        self.__refresh_token.create_index([("created_at", 1)], expireAfterSeconds=300) # change this as soon as it is verified to work
        self.__otp_code = self.__db["otp_code"]
        self.__otp_code.create_index([("created_at")], expireAfterSeconds=600) # expire after 10 minutes

    def save_user(self, **kwargs):
        """ a method to save the user into the database
        Args:
            kwargs (dict): the arguments of the class to save

        return the saved user
        """

        result = self.__user.insert_one(kwargs)

        user_id = result.inserted_id
        
        return function_response(True, {"user_id":user_id})
    
    def get_user_by_email(self, email: str):
        """ a method to get the user from the database using the user email address
        Args:
            email (str): the email address of the user to get from the database
        return a response with the user if a user is found
        """

        user = self.__user.find_one({"email": email})
        if not user:
            return function_response(False)
        # verify that the password passed is the correct one
        return function_response(True, user)
        
    def get_user_by_id(self, user_id: str):
        """ a method to get the user by the user id
        Args:
            user_id (str): the user id to use in location a user
        Returns a response containing the user
        """

        try:
            user = self.__user.find_one({"_id": ObjectId(user_id)})

            if not user:
                return function_response(False)
            del user["password"]
            return function_response(True, user)
        except Exception:
            return function_response(False)
        
    def update_user_by_id(self, user_id: str, **kwargs):
        """ a method to update the given user by the provided user id
        Args:
            user_id (str): the user id to be affected
            kwargs: the arguments to be updated on the document
        """

        update_result = self.__user.update_one({"_id": ObjectId(user_id)}, {"$set": kwargs})
        if not update_result.acknowledged:
            return function_response(False)
        return function_response(True) # change this to return the data gotten from the database
        
    def update_password(self, user_id: str, old_password: str, new_password: str):
        """ a method to update the user password to a new one
        Args:
            user_id: the user id of the user
            old_password: the old password of the user
            new_password: the password to change to
        """

        user = self.__user.find_one({"_id": ObjectId(user_id)})
        if not user:
            return function_response(False)

        try:
            ph.verify(user.get("password"), old_password)
        except VerifyMismatchError:
            return function_response(False)
        
        self.__user.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": ph.hash(new_password)}})
        return function_response(True)

    def delete_user(self, user_id: str):
        """ a methodn to delete a  user from the database
        Args:
            user_id (str): a string containing the user id to be deleted
        """
        self.__user.delete_many({"_id": ObjectId(user_id)})

    def save_refresh_token(self, refresh_token_object: Dict):
        """ a method to save the refresh token and the email to the database
        Args:
            token (str): the token to be saved
            user_id (str): the user_id associated with the token
        """

        # delete any saved refresh token of the user
        self.delete_refresh_token(refresh_token_object.get("user_id"))

        refresh_token = self.__refresh_token.insert_one(refresh_token_object)
        if refresh_token.acknowledged:
            return function_response(True)
        return function_response(False)
    
    def delete_refresh_token(self, user_id):
        """ a method to delete the refresh token associated with the email
        Args:
            email (str): the email or the associated refresh token
        """

        self.__refresh_token.delete_many({"user_id": user_id})

    def get_refresh_token(self, refresh_token: str):
        """ a method to verify the refresh token
        Args:
            token (str): the refresh_token
        Return the user_id associated with the refresh token if found
        """

        refresh_dict = self.__refresh_token.find_one({"token": refresh_token})
        if not refresh_dict:
            return function_response(False)
        
        # delete the token if a token is found
        self.delete_refresh_token(refresh_token)
        return function_response(True, {"user_id": refresh_dict.get("user_id")})
    
    def save_otp_code(self, otp_dict: Dict):
        """ a method to save the provided otp code for each user
        Args:
            email (str): the email address to save the otp code in
            otp_code (str): the code to save
        Return a bool for successful save or not
        """

        previous_otp_dict = self.__otp_code.find_one({"email": otp_dict.get("email")})

        if previous_otp_dict:
            if previous_otp_dict.get("count") == 3:
                # the required request for otp validation is passed the user should wait for 10 minuites before requesting again

                return function_response(False)

            result = self.__otp_code.update_one(
                {"email": otp_dict.get("email")},
                {"$set": {"code": otp_dict.get("code"), "count": previous_otp_dict.get("count") + 1}}
            )
        else:
            result = self.__otp_code.insert_one(otp_dict)
        return function_response(True)
    
    def get_code_email(self, code: str):
        """ a method to get the email address associated with a code
        Args:
            code (str): the otp code of the user
        Return the email address upon successful retrival
        """

        otp_dict = self.__otp_code.find_one({"code": code})
        if otp_dict:
            self.delete_otp_code(otp_dict.get("email"))
            return function_response(True, otp_dict)
        return function_response(False)
    
    def delete_otp_code(self, email: str):
        """ a method to delete the otp code of the user
        Args:
            email (str): the token to be deleted from the database
        """

        self.__otp_code.delete_many({"email": email})
    
storage = DBStorage()
    