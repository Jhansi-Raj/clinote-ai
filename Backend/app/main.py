from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import analyze, runs, upload
from app.utils.logger import configure_logging, get_logger

configure_logging()
log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("clinote_ai.startup", version="1.0.0")
    yield
    log.info("clinote_ai.shutdown")


app = FastAPI(
    title="Clinote AI API",
    description=(
        "Safe AI document analysis for clinical discharge summaries. "
        "Never fabricates. Always flags. Every output is a draft for clinician review."
    ),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─────────────────────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────
app.include_router(upload.router, tags=["Documents"])
app.include_router(analyze.router, tags=["Analysis"])
app.include_router(runs.router, tags=["Runs"])


# ─────────────────────────────────────────────────────────────
# Global exception handler
# ─────────────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    log.error("unhandled_exception", path=request.url.path, error=str(exc))
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)},
    )


# ─────────────────────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
async def health() -> dict:
    return {"status": "ok", "service": "clinote-ai", "version": "1.0.0"}


@app.get("/", tags=["System"])
async def root() -> dict:
    return {
        "service": "Clinote AI API",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "upload": "POST /upload",
            "analyze": "POST /analyze",
            "get_run": "GET /runs/{run_id}",
            "list_runs": "GET /runs",
        },
    }
