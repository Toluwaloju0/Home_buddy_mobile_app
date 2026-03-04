""" a module to show how refresh tokens are to be saved in the database"""

from .base_model import Basemodel

class RefreshToken(Basemodel):
    """ the class of the refresh token obj"""

    def __init__(self, token: str, user_id: str):
        """ the initializer for the class
        Args:
            token (str): the token to be saved into the database
            email (str): the email address associated with the token
        """

        self.token = token
        self.user_id = user_id
