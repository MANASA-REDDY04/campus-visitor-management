"""
visitor_service.py  –  All business logic for visitor + visit operations.
Uses the Supabase Python client directly (no SQLAlchemy).
"""
from datetime import date, datetime, timezone
from typing import Optional, List, Dict, Any

from fastapi import HTTPException, status

import httpx
from app.database import supabase
from app.schemas.visitor import VisitCreate
from app.models.enums import VisitStatus
from app.utils.helpers import generate_pass_id, generate_uuid, utc_now


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _raise(code: int, msg: str):
    raise HTTPException(status_code=code, detail=msg)


def _execute_query(query, max_retries: int = 2):
    """Execute a Supabase PostgREST query with automatic retry on disconnected keep-alive connections."""
    for attempt in range(max_retries):
        try:
            return query.execute()
        except (httpx.RemoteProtocolError, httpx.ReadTimeout, httpx.ConnectError):
            if attempt == max_retries - 1:
                raise


def _enrich_visit(visit: dict) -> dict:
    """Ensure visitor data is attached under 'visitor'."""
    if "visitor" in visit and visit["visitor"] is not None:
        return visit
    try:
        visitor_resp = _execute_query(
            supabase.table("visitors")
            .select("*")
            .eq("id", visit["visitor_id"])
            .single()
        )
        visit["visitor"] = visitor_resp.data
    except Exception:
        pass
    return visit


# ─── Registration ─────────────────────────────────────────────────────────────

def register_visit(payload: VisitCreate) -> dict:
    """
    1. Create (or reuse) visitor record.
    2. Create visit record with PENDING status.
    Returns the created visit with pass_id.
    """
    now = utc_now().isoformat()

    # 1. Insert visitor
    visitor_id = generate_uuid()
    visitor_data = {
        "id": visitor_id,
        "full_name": payload.full_name,
        "phone": payload.phone,
        "email": payload.email,
        "visitor_type": payload.visitor_type.value,
        "created_at": now,
    }
    vis_resp = supabase.table("visitors").insert(visitor_data).execute()
    if not vis_resp.data:
        _raise(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to create visitor record")

    # 2. Insert visit
    visit_id = generate_uuid()
    pass_id = generate_pass_id()

    visit_data = {
        "id": visit_id,
        "visitor_id": visitor_id,
        "person_to_visit": payload.person_to_visit,
        "department": payload.department,
        "purpose": payload.purpose,
        "visit_date": payload.visit_date.isoformat(),
        "arrival_time": payload.arrival_time,
        "departure_time": payload.departure_time,
        "status": VisitStatus.PENDING.value,
        "pass_id": pass_id,
        "check_in_time": None,
        "check_out_time": None,
        "created_at": now,
        "updated_at": now,
    }
    visit_resp = supabase.table("visits").insert(visit_data).execute()
    if not visit_resp.data:
        _raise(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to create visit record")

    return visit_resp.data[0]


# ─── Get single visit ─────────────────────────────────────────────────────────

def get_visit_by_id(visit_id: str) -> dict:
    resp = _execute_query(
        supabase.table("visits")
        .select("*, visitor:visitors(*)")
        .eq("id", visit_id)
        .single()
    )
    if not resp.data:
        _raise(status.HTTP_404_NOT_FOUND, "Visit not found")
    return resp.data


# ─── Get visit by pass_id ─────────────────────────────────────────────────────

def get_visit_by_pass_id(pass_id: str) -> dict:
    resp = _execute_query(
        supabase.table("visits")
        .select("*, visitor:visitors(*)")
        .eq("pass_id", pass_id)
        .single()
    )
    if not resp.data:
        _raise(status.HTTP_404_NOT_FOUND, "Visitor pass not found")
    return resp.data


# ─── Admin: list visits ───────────────────────────────────────────────────────

def list_visits(
    visit_status: Optional[str] = None,
    visit_date: Optional[str] = None,
    department: Optional[str] = None,
) -> List[dict]:
    query = supabase.table("visits").select("*, visitor:visitors(*)").order("created_at", desc=True)

    if visit_status:
        query = query.eq("status", visit_status.upper())
    if visit_date:
        query = query.eq("visit_date", visit_date)
    if department:
        query = query.ilike("department", f"%{department}%")

    resp = _execute_query(query)
    return resp.data or []


# ─── Admin: approve / reject ──────────────────────────────────────────────────

def approve_visit(visit_id: str) -> dict:
    now = utc_now().isoformat()
    resp = (
        supabase.table("visits")
        .update({"status": VisitStatus.APPROVED.value, "updated_at": now})
        .eq("id", visit_id)
        .execute()
    )
    if not resp.data:
        _raise(status.HTTP_404_NOT_FOUND, "Visit not found")
    return _enrich_visit(resp.data[0])


def reject_visit(visit_id: str) -> dict:
    now = utc_now().isoformat()
    resp = (
        supabase.table("visits")
        .update({"status": VisitStatus.REJECTED.value, "updated_at": now})
        .eq("id", visit_id)
        .execute()
    )
    if not resp.data:
        _raise(status.HTTP_404_NOT_FOUND, "Visit not found")
    return _enrich_visit(resp.data[0])


# ─── Dashboard stats ──────────────────────────────────────────────────────────

def get_dashboard_stats() -> dict:
    all_resp = supabase.table("visits").select("status").execute()
    visits = all_resp.data or []

    total = len(visits)
    pending = sum(1 for v in visits if v["status"] == VisitStatus.PENDING.value)
    approved = sum(1 for v in visits if v["status"] == VisitStatus.APPROVED.value)
    inside = sum(1 for v in visits if v["status"] == VisitStatus.CHECKED_IN.value)

    return {
        "total_visitors": total,
        "pending_requests": pending,
        "approved_visits": approved,
        "currently_inside": inside,
    }


# ─── Security: today's visitors ───────────────────────────────────────────────

def get_todays_visitors() -> List[dict]:
    today = date.today().isoformat()
    resp = _execute_query(
        supabase.table("visits")
        .select("*, visitor:visitors(*)")
        .eq("visit_date", today)
        .order("arrival_time")
    )
    return resp.data or []


# ─── Security: verify pass ────────────────────────────────────────────────────

def verify_pass(pass_id: str) -> dict:
    resp = _execute_query(
        supabase.table("visits")
        .select("*, visitor:visitors(*)")
        .eq("pass_id", pass_id)
        .single()
    )
    if not resp.data:
        return {"valid": False, "message": "Invalid pass ID. No such visitor pass found.", "visit": None}

    visit = resp.data
    visit_status = visit["status"]

    if visit_status == VisitStatus.REJECTED.value:
        return {"valid": False, "message": "This visitor pass has been rejected.", "visit": visit}
    if visit_status == VisitStatus.CANCELLED.value:
        return {"valid": False, "message": "This visitor pass has been cancelled.", "visit": visit}
    if visit_status == VisitStatus.PENDING.value:
        return {"valid": False, "message": "This visit request is still pending approval.", "visit": visit}
    if visit_status == VisitStatus.COMPLETED.value:
        return {"valid": False, "message": "This visit has already been completed.", "visit": visit}
    if visit_status == VisitStatus.CHECKED_IN.value:
        return {"valid": True, "message": "Visitor is currently checked in.", "visit": visit}
    if visit_status == VisitStatus.APPROVED.value:
        return {"valid": True, "message": "Valid visitor pass. Ready to check in.", "visit": visit}

    return {"valid": False, "message": "Unknown pass status.", "visit": visit}


# ─── Security: check-in ───────────────────────────────────────────────────────

def check_in_visitor(visit_id: str) -> dict:
    # Fetch current status first
    existing = supabase.table("visits").select("status").eq("id", visit_id).single().execute()
    if not existing.data:
        _raise(status.HTTP_404_NOT_FOUND, "Visit not found")

    current_status = existing.data["status"]
    if current_status != VisitStatus.APPROVED.value:
        _raise(
            status.HTTP_400_BAD_REQUEST,
            f"Cannot check in. Current status is '{current_status}'. Only APPROVED visits can be checked in.",
        )

    now = utc_now().isoformat()
    resp = (
        supabase.table("visits")
        .update({
            "status": VisitStatus.CHECKED_IN.value,
            "check_in_time": now,
            "updated_at": now,
        })
        .eq("id", visit_id)
        .execute()
    )
    if not resp.data:
        _raise(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to check in visitor")
    return _enrich_visit(resp.data[0])


# ─── Security: check-out ──────────────────────────────────────────────────────

def check_out_visitor(visit_id: str) -> dict:
    existing = supabase.table("visits").select("status").eq("id", visit_id).single().execute()
    if not existing.data:
        _raise(status.HTTP_404_NOT_FOUND, "Visit not found")

    current_status = existing.data["status"]
    if current_status != VisitStatus.CHECKED_IN.value:
        _raise(
            status.HTTP_400_BAD_REQUEST,
            f"Cannot check out. Current status is '{current_status}'. Only CHECKED_IN visitors can be checked out.",
        )

    now = utc_now().isoformat()
    resp = (
        supabase.table("visits")
        .update({
            "status": VisitStatus.COMPLETED.value,
            "check_out_time": now,
            "updated_at": now,
        })
        .eq("id", visit_id)
        .execute()
    )
    if not resp.data:
        _raise(status.HTTP_500_INTERNAL_SERVER_ERROR, "Failed to check out visitor")
    return _enrich_visit(resp.data[0])


# ─── History ──────────────────────────────────────────────────────────────────

def get_visit_history(
    visit_date: Optional[str] = None,
    department: Optional[str] = None,
    visit_status: Optional[str] = None,
) -> List[dict]:
    query = (
        supabase.table("visits")
        .select("*, visitor:visitors(*)")
        .order("created_at", desc=True)
    )

    if visit_status:
        query = query.eq("status", visit_status.upper())
    if visit_date:
        query = query.eq("visit_date", visit_date)
    if department:
        query = query.ilike("department", f"%{department}%")

    resp = _execute_query(query)
    return resp.data or []
