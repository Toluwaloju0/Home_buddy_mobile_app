""" a module to create a middleware class for creating database object for database connectionn and operations """

from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

from database.db_engine import DBStorage

class DBSessionMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):

        try:
            # attach to request state
            request.state.storage = DBStorage()
            response = await call_next(request)
            return response
        except Exception:
            raise Exception
