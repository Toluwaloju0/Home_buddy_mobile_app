""" a module to define the user and user create classes """

import enum

from pydantic import BaseModel

from models.base_model import Basemodel
from database.db_engine import storage
from utils.responses import function_response

class UserRole(str, enum.Enum):
    """ a class to define the user roles accepted """

    SELLER = "seller"
    BUYER = "buyer"
    ADMIN = "admin"
class UserLogin(BaseModel):
    """ a method to login a user """
    
    email: str
    password: str

class UserCreate(BaseModel):
    """ the class to use when creating or logging in a user """

    email: str
    password: str
    first_name: str | None = None
    last_name: str | None = None
    role: UserRole | None = None
    phone_number: str | None = None


class User(Basemodel):
    """The base model class"""

    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    is_verified: bool = False
    role: UserRole = UserRole.BUYER
    password: str | None = None
    phone_number: str | None = None
    phone_number_verified: bool = False
    image_url: str | None = None

    def __init__(self, **kwargs):
        """ the initializing class 
        Args:
            kwargs: the keyword arguments to pass to the class for initializing
        """

        super().__init__()
        for key, val in kwargs.items():
            setattr(self, key, val)

    def save(self):
        """ a method to save the class to the database"""

        save_user_response = storage.save_user(**self.to_dict())

        if not save_user_response.status:
            return function_response(False)
        return save_user_response
