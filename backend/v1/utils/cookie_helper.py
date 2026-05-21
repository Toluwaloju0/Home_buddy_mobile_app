""" Helper function to set cookies with proper configuration """

from fastapi.responses import JSONResponse

def set_auth_cookies(response: JSONResponse, access_token: str, refresh_token: str):
    """
    Set authentication cookies with proper cross-origin configuration
    
    Args:
        response: FastAPI JSONResponse object
        access_token: JWT access token
        refresh_token: JWT refresh token
    """
    # Access token - expires in 5 minutes
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # Prevents JavaScript access (security)
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",  # Important for cross-origin requests
        max_age=300  # 5 minutes (matches your JWT expiry)
    )
    
    # Refresh token - expires in 30 seconds (as per your settings)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,  # Set to True in production
        samesite="lax",
        max_age=30  # 30 seconds
    )
