import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import face_routes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

app = FastAPI(
    title="TechRush FaceID Service",
    description="Microservice for passwordless face recognition authentication",
    version="1.0.0"
)

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(face_routes.router, prefix="/api/face", tags=["Face Authentication"])

@app.get("/health", tags=["System"])
def health_check():
    """Simple health check endpoint."""
    return {"status": "up"}
