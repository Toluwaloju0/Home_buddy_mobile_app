""" 
a module to define a function to create a token used to
save the user objectwhich password is to be updated 
"""

import hashlib

def hash_token(token: str):
    """ a function to hash the provided tokens and return the hash
    Args:
        token: the token object in bytes
    """

    return hashlib.sha256(token.encode("utf-8")).hexdigest()

