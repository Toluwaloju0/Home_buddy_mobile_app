""" a module to create a database connection and provide access to the database storage class"""

from fastapi import Request

def get_db(request: Request):
    """ a method to create a database connection and provide access to the database storage class
    Return: an instance of the database storage class
    """

    return request.state.storage
