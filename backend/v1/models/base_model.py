""" a method to define the base model for all users"""

from datetime import datetime

class Basemodel:
    """ the base class for all other classes"""

    def __init__(self):
        """ the initializer for the class """

        self.created_at = datetime.now()

    def to_dict(self):
        """ a method to convert the class to a dictionary """

        return self.__dict__
    
