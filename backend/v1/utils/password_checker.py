""" a module to check the strenth of the password"""

from .responses import function_response

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

    # for char in str:

    return function_response(True)
