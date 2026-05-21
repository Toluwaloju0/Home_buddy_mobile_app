""" a module to create responses class for the api and functions """

from typing import Dict

class FunctionResponse:
    """The class to define the responses of all functions"""

    def __init__(self, status: bool, payload: Dict | None = None):
        """ the initializer for the class"""

        self.status = status
        self.payload = payload

    def to_dict(self):
        return self.__dict__

class APIResponse:
    """ a class for all my endpoint returns """

    def __init__(self, status: bool, message: str, payload: Dict | None = None, next_url: str | None = None):
        self.status = status
        self.message = message
        self.payload = payload
        self.next_url = next_url

    def to_dict(self):
        """ A method to convert the class to a dictionary """

        my_dict = {}
        my_dict.update(self.__dict__)

        if my_dict.get("payload"):
            if my_dict["payload"].get("created_at"):
                del my_dict["payload"]["created_at"]
            if my_dict["payload"].get("_id"):
                my_dict["payload"]["_id"] = str(my_dict["payload"]["_id"])

        return my_dict
