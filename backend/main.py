"""
main.py — FastAPI app entry point.
Configures CORS and mounts all routers.
"""
import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import get_pool, close_pool
from routers import land

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: warm up DB pool
    await get_pool()
    yield
    # Shutdown: close DB pool
    await close_pool()


app = FastAPI(
    title="TN Land Tracker API",
    description=(
        "Read-only API for Tamil Nadu land parcel data. "
        "Data sourced from TN eServices and TNREGINET."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────
app.include_router(land.router, prefix="/land", tags=["land"])


@app.get("/", tags=["health"])
async def health_check():
    return {
        "status": "ok",
        "service": "TN Land Tracker API",
        "version": "1.0.0",
        "note": "Read-only API. No authentication required.",
    }
