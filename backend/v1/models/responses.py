""" a module to create responses class for the api and functions """

from typing import Dict
from bson import ObjectId
from datetime import datetime

def serialize_mongo_value(value):
    """Convert Mongo-specific values into JSON-safe primitives."""

    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, dict):
        return {key: serialize_mongo_value(item) for key, item in value.items()}
    if isinstance(value, list):
        return [serialize_mongo_value(item) for item in value]
    return value

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

    def __init__(self, status: bool, message: str, payload: Dict | None = None):
        self.status = status
        self.message = message
        self.payload = payload

    def to_dict(self):
        """ A method to convert the class to a dictionary """

        my_dict = {}
        my_dict.update(self.__dict__)

        if not my_dict.get("payload"):
            return my_dict

        if isinstance(my_dict["payload"], dict):
            for key, value in my_dict["payload"].items():
                if isinstance(value, dict):
                    for n_key, n_value in value.items():
                        if isinstance(n_value, ObjectId):
                            value[n_key] = str(n_value)
                        elif isinstance(n_value, datetime):
                            value[n_key] = n_value.isoformat()
                elif isinstance(value, ObjectId):
                    my_dict["payload"][key] = str(value)
                elif isinstance(value, datetime):
                    my_dict["payload"][key] = value.isoformat()
        elif isinstance(my_dict["payload"], list):
            for item in my_dict["payload"]:
                if isinstance(item, dict):
                    for key, value in item.items():
                        if isinstance(value, ObjectId):
                            item[key] = str(value)
                elif isinstance(item, ObjectId):
                    item = str(item)
                elif isinstance(item, datetime):
                    item = item.isoformat()

        return my_dict

    def __str__(self):
        return f"{self.__dict__}"
