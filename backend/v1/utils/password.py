""" a module to create a password services for all my passwords """

import string
from argon2 import PasswordHasher
from .responses import function_response

ph = PasswordHasher(hash_len=50, salt_len=50)

def password_strength_checker(password: str):
    """ a function to check the strength of passwords passed to the API
    Args:
        password (str): the password to be checked
    Return a bool of the password strength status
    """

    if len(password) < 8:
        return function_response(False)
    
    has_number = False
    has_caps = False
    has_symbol = False

    for char in password:
        if char.isdigit():
            has_number = True
        elif char.isupper():
            has_caps = True
        elif char in string.punctuation:
            has_symbol = True

    return function_response(has_symbol and has_caps and has_number)
