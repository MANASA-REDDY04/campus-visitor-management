"""
security_router.py  –  Security desk endpoints: today's visitors, pass verification, check-in/out.
"""
from fastapi import APIRouter
from app.services.visitor_service import (
    get_todays_visitors,
    verify_pass,
    check_in_visitor,
    check_out_visitor,
)

router = APIRouter(prefix="/api/security", tags=["Security"])


@router.get("/today")
def todays_visitors():
    """Get all visitors scheduled for today."""
    visitors = get_todays_visitors()
    return {"success": True, "message": "Today's visitors retrieved", "data": visitors}


@router.get("/verify/{pass_id}")
def verify_visitor_pass(pass_id: str):
    """Verify a visitor pass by its pass ID."""
    result = verify_pass(pass_id)
    return {
        "success": result["valid"],
        "message": result["message"],
        "data": result["visit"],
    }


@router.patch("/{visit_id}/check-in")
def check_in(visit_id: str):
    """Check a visitor in."""
    visit = check_in_visitor(visit_id)
    return {"success": True, "message": "Visitor checked in successfully", "data": visit}


@router.patch("/{visit_id}/check-out")
def check_out(visit_id: str):
    """Check a visitor out."""
    visit = check_out_visitor(visit_id)
    return {"success": True, "message": "Visitor checked out successfully", "data": visit}
