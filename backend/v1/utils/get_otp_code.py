""" a module to create a function to get the provided otp code for user validation"""

from uuid import uuid4

def get_otp_code():
    """ a function to get a six length otp code for user validation
    Returns the otp code to secure the user with
    """

    return str(uuid4())[2:8]
