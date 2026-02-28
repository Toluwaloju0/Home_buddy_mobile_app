""" a module to create functions to call my responses classes"""

from typing import Dict

from models.responses import APIResponse, FunctionResponse

def function_response(status, payload = None):
    """ a function and return the response of a function
    Args:
        status (bool): the status of the function
        payload (dict): the content or the function run
    """

    return FunctionResponse(status, payload)

def api_response(status, message: str, payload: Dict | None=None, next_url: str | None=None):
    """ a function to create a response for the api """

    return APIResponse(status, message, payload, next_url)
