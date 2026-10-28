"""
main.py  –  FastAPI application entry point.
"""
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routers.visitors import router as visitors_router
from app.routers.admin import router as admin_router
from app.routers.security import router as security_router
from app.routers.auth import router as auth_router

app = FastAPI(
    title="CBIT Campus Visitor Management System API",
    description="REST API for managing CBIT campus visitors, visit requests, and pass verification.",
    version="1.0.0",
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(visitors_router)
app.include_router(admin_router)
app.include_router(security_router)


# ─── Global exception handler ─────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": str(exc)},
    )


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def health_check():
    return {"success": True, "message": "Campus Visitor Management System API is running"}


@app.get("/health", tags=["Health"])
def health():
    return {"success": True, "status": "healthy"}
