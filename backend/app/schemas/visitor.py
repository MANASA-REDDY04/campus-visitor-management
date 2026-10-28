from datetime import datetime, date, time
from typing import Optional
from pydantic import BaseModel, EmailStr, field_validator
from app.models.enums import VisitorType, VisitStatus


# ─── Visitor Schemas ──────────────────────────────────────────────────────────

class VisitorBase(BaseModel):
    full_name: str
    phone: str
    email: Optional[str] = None
    visitor_type: VisitorType


class VisitorCreate(VisitorBase):
    pass


class VisitorOut(VisitorBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Visit Schemas ────────────────────────────────────────────────────────────

class VisitBase(BaseModel):
    person_to_visit: str
    department: str
    purpose: str
    visit_date: date
    arrival_time: str      # "HH:MM"
    departure_time: Optional[str] = None


class VisitCreate(BaseModel):
    """Combined registration: visitor info + visit info."""
    # Visitor fields
    full_name: str
    phone: str
    email: Optional[str] = None
    visitor_type: VisitorType

    # Visit fields
    person_to_visit: str
    department: str
    purpose: str
    visit_date: date
    arrival_time: str
    departure_time: Optional[str] = None

    @field_validator("full_name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name is required")
        return v.strip()

    @field_validator("phone")
    @classmethod
    def phone_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Phone number is required")
        return v.strip()

    @field_validator("purpose")
    @classmethod
    def purpose_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Purpose is required")
        return v.strip()

    @field_validator("person_to_visit")
    @classmethod
    def person_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Person to visit is required")
        return v.strip()


class VisitOut(BaseModel):
    id: str
    visitor_id: str
    person_to_visit: str
    department: str
    purpose: str
    visit_date: date
    arrival_time: str
    departure_time: Optional[str] = None
    status: VisitStatus
    pass_id: str
    check_in_time: Optional[datetime] = None
    check_out_time: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VisitWithVisitor(VisitOut):
    """Visit enriched with visitor details (for admin/security views)."""
    visitor: VisitorOut


# ─── Response Schemas ─────────────────────────────────────────────────────────

class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[dict] = None


class ErrorResponse(BaseModel):
    success: bool = False
    message: str


class RegisterResponse(BaseModel):
    success: bool = True
    message: str
    visit_id: str
    pass_id: str
    status: VisitStatus


# ─── Dashboard Stats ──────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_visitors: int
    pending_requests: int
    approved_visits: int
    currently_inside: int


# ─── Pass Verification ────────────────────────────────────────────────────────

class PassVerifyResponse(BaseModel):
    success: bool
    message: str
    visit: Optional[VisitWithVisitor] = None
