from enum import Enum


class VisitorType(str, Enum):
    PARENT = "PARENT"
    GUEST = "GUEST"
    VENDOR = "VENDOR"
    ALUMNI = "ALUMNI"
    OTHER = "OTHER"


class VisitStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    CHECKED_IN = "CHECKED_IN"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"
    SECURITY = "SECURITY"
