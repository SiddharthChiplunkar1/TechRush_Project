import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.database import Base, engine
from app.config.settings import settings
from app.controller.face_controller import router as face_router
from app.exceptions.handlers import setup_exception_handlers

# -------------------------------------------------------------------
# Logging
# -------------------------------------------------------------------

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Database
# -------------------------------------------------------------------

Base.metadata.create_all(bind=engine)
logger.info("Database initialized")


# -------------------------------------------------------------------
# Lifespan
# -------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("========================================")
    logger.info("Starting FaceID Service")
    logger.info("========================================")
    logger.info(f"Database : {settings.database_url.split('@')[-1]}")
    logger.info(f"Threshold: {settings.similarity_threshold}")
    logger.info(f"Debug    : {settings.debug}")

    yield

    logger.info("Stopping FaceID Service")


# -------------------------------------------------------------------
# FastAPI
# -------------------------------------------------------------------

app = FastAPI(
    title="FaceID Service",
    description="Face recognition service",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# -------------------------------------------------------------------
# Exception handlers
# -------------------------------------------------------------------

setup_exception_handlers(app)

# -------------------------------------------------------------------
# CORS
# -------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------------
# Routes
# -------------------------------------------------------------------

app.include_router(face_router, prefix="/api/face")


@app.get("/")
async def root():
    return {
        "service": "faceid-service",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }
    
@app.get("/health")
async def health():
    return {"status": "ok"}

# -------------------------------------------------------------------
# Local development
# -------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )