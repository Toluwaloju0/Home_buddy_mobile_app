""" a module to define the user and user create classes """

from pydantic import BaseModel

from models.base_model import Basemodel
from database.db_engine import storage
from utils.responses import function_response

class UserCreate(BaseModel):
    """ the class to use when creating a new user """

    email: str
    password: str

class User(Basemodel):
    """The base model class"""

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

        