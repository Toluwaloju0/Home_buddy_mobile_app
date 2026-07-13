""" a module to create a database connection and provide access to the database storage class"""

def get_db():
    """ a method to create a database connection and provide access to the database storage class
    Return: an instance of the database storage class
    """

    from database.db_engine import DBStorage

    return DBStorage()
