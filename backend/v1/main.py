""" a module to define the main application """

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
from pathlib import Path

from routes.auth_route import auth
from routes.user_route import user
from routes.google_auth_route import google_auth
from routes.seller_route import seller
from routes.properties_route import properties
from routes.admin_route import admin
from routes.escrow_route import escrow
from routes.disputes_route import disputes
from routes.areas_route import areas
from routes.inspections_route import inspections
from routes.inquiries_route import inquiries
from routes.messages_route import messages
from utils.settings import settings
from database.db_engine import storage
   
app = FastAPI(
    title="PROPERTIX",
    description="The Propertix API for all the frontend needs",
    version="1.0.0"
)

uploads_dir = Path(__file__).resolve().parent / "uploads"
uploads_dir.mkdir(parents=True, exist_ok=True)

# CRITICAL: Configure CORS for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js default dev server
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        # Add your production domain here later
    ],
    allow_credentials=True,  # IMPORTANT: Required for cookies
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],  # Allow all headers
)

app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

@app.get("/")
async def homepage():
    return {"message": "Welcome to propertix api"}

@app.get("/status")
async def get_status():
    return {"message": "The API is active"}


@app.on_event("startup")
async def startup_event():
    await storage.init_indexes()
    await storage.ping()


app.include_router(auth)
app.include_router(user)
app.include_router(seller)
app.include_router(google_auth)
app.include_router(properties)
app.include_router(admin)
app.include_router(escrow)
app.include_router(disputes)
app.include_router(areas)
app.include_router(inspections)
app.include_router(inquiries)
app.include_router(messages)


if __name__ == "__main__":
    uvicorn.run("main:app", port=settings.backend_port, reload=True)
