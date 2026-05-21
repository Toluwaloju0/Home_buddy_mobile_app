""" a module to define a function to check if the provided email is among our list of approved domains"""

from utils.responses import function_response

def email_domain_checker(email_address):
    """ a function to check the email if it is among the lists of approved domains
    Args:
        email_address (str): the email address to check
        Return a bool value for the approved email
    """

    domain = email_address.split("@")[1]
    if not domain:
        return function_response(False)
    if domain not in ["gmail.com", "yahoo.com", "outlook.com"]:
        return function_response(False)
    return function_response(True)
