""" an module to create a reset password model to store the user object"""

from pydantic import BaseModel
from datetime import datetime
from typing import Any

class PasswordReset(BaseModel):
    """ the class to define the password reset class for password reset objects """

    user_id: Any
    token: str
    created_at: datetime = datetime.now()
    used: bool = False
    count: int
