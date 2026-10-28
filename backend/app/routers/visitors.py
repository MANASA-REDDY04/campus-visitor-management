"""
visitors_router.py  –  Public visitor-facing endpoints.
"""
from fastapi import APIRouter
from app.schemas.visitor import VisitCreate, RegisterResponse
from app.services.visitor_service import register_visit, get_visit_by_id, get_visit_by_pass_id

router = APIRouter(prefix="/api/visitors", tags=["Visitors"])


@router.post("/register", response_model=RegisterResponse, status_code=201)
def register(payload: VisitCreate):
    """Register a new visitor and create a visit request."""
    visit = register_visit(payload)
    return RegisterResponse(
        success=True,
        message="Visit request submitted successfully.",
        visit_id=visit["id"],
        pass_id=visit["pass_id"],
        status=visit["status"],
    )


@router.get("/visits/{visit_id}")
def get_visit(visit_id: str):
    """Get a specific visit by its ID."""
    visit = get_visit_by_id(visit_id)
    return {"success": True, "message": "Visit retrieved", "data": visit}


@router.get("/visits/pass/{pass_id}")
def get_pass(pass_id: str):
    """Get visitor pass information by pass ID."""
    visit = get_visit_by_pass_id(pass_id)
    return {"success": True, "message": "Pass retrieved", "data": visit}
