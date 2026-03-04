# """ a module to define the main application """

# from dotenv import load_dotenv
# load_dotenv()

# from fastapi import FastAPI
# import uvicorn
# from os import getenv

# from routes.auth_route import auth
# from routes.user_route import user

# app = FastAPI(
#     title="PROPERTIX",
#     description="The Propertix API for all the frontend needs",
#     version="1.0.0"
# )

# @app.get("/")
# def homepage():
#     return "Welcome to propertix api"

# @app.get("/status")
# def get_status():
#     return {"message": "The API is active"}


# app.include_router(auth)
# app.include_router(user)

# if __name__ == "__main__":
#     port = int(getenv("BACKEND_PORT", 8000))
#     uvicorn.run("main:app", port=port, reload=True)

""" a module to define the main application """

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from os import getenv

from routes.auth_route import auth
from routes.user_route import user

from routes.google_auth_route import google_auth
   

app = FastAPI(
    title="PROPERTIX",
    description="The Propertix API for all the frontend needs",
    version="1.0.0"
)

# CRITICAL: Configure CORS for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default dev server
        "http://127.0.0.1:3000",
        # Add your production domain here later
    ],
    allow_credentials=True,  # IMPORTANT: Required for cookies
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

@app.get("/")
def homepage():
    return {"message": "Welcome to propertix api"}

@app.get("/status")
def get_status():
    return {"message": "The API is active"}


app.include_router(auth)
app.include_router(user)
app.include_router(google_auth)

if __name__ == "__main__":
    port = int(getenv("BACKEND_PORT", 8000))
    uvicorn.run("main:app", port=port, reload=True)