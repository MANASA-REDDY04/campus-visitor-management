"""
admin_router.py  –  Admin dashboard and visit management endpoints.
"""
from typing import Optional
from fastapi import APIRouter, Query
from app.services.visitor_service import (
    list_visits,
    approve_visit,
    reject_visit,
    get_dashboard_stats,
    get_visit_history,
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats")
def dashboard_stats():
    """Get summary statistics for the admin dashboard."""
    stats = get_dashboard_stats()
    return {"success": True, "message": "Stats retrieved", "data": stats}


@router.get("/visits")
def all_visits(
    status: Optional[str] = Query(None, description="Filter by visit status"),
    date: Optional[str] = Query(None, description="Filter by visit date (YYYY-MM-DD)"),
    department: Optional[str] = Query(None, description="Filter by department"),
):
    """Get all visit requests with optional filters."""
    visits = list_visits(visit_status=status, visit_date=date, department=department)
    return {"success": True, "message": "Visits retrieved", "data": visits}


@router.patch("/visits/{visit_id}/approve")
def approve(visit_id: str):
    """Approve a visit request."""
    visit = approve_visit(visit_id)
    return {"success": True, "message": "Visit approved successfully", "data": visit}


@router.patch("/visits/{visit_id}/reject")
def reject(visit_id: str):
    """Reject a visit request."""
    visit = reject_visit(visit_id)
    return {"success": True, "message": "Visit rejected successfully", "data": visit}


@router.get("/history")
def visit_history(
    date: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
):
    """Get visit history with optional filters."""
    visits = get_visit_history(visit_date=date, department=department, visit_status=status)
    return {"success": True, "message": "History retrieved", "data": visits}
