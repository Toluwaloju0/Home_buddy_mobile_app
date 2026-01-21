""" a module to define the main application """

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
import uvicorn
from os import getenv

from routes.auth_route import auth
from routes.user_route import user

app = FastAPI(
    title="PROPERTIX",
    description="The Propertix API for all the frontend needs",
    version="1.0.0"
)

@app.get("/")
def homepage():
    return "Welcome to propertix api"

@app.get("/status")
def get_status():
    return {"message": "The API is active"}


app.include_router(auth)
app.include_router(user)

if __name__ == "__main__":
    port = int(getenv("BACKEND_PORT", 8000))
    uvicorn.run("main:app", port=port, reload=True)