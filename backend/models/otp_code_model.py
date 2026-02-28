""" a module to get the otp code model for the database"""

from .base_model import Basemodel

class OtpCode(Basemodel):
    """ the otp code model """

    def __init__(self, email: str, code: str):
        """ the initializer of the class
        Args:
            email (str): the email address associated with the otp code
            code (str): the otp code
        """

        super().__init__()

        self.email = email
        self.code = code
        self.count = 1