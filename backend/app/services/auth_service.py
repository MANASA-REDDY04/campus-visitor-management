import uuid
from typing import Optional, Dict, Any
from app.database import supabase
from app.models.enums import UserRole
from app.schemas.auth import LoginRequest, UserInfo

# Pre-configured default system accounts
PRESET_ACCOUNTS = {
    "admin": {
        "id": "u0000000-0000-0000-0000-000000000001",
        "username": "admin",
        "password": "admin123",
        "name": "CBIT Administrator",
        "role": UserRole.ADMIN,
    },
    "manager": {
        "id": "u0000000-0000-0000-0000-000000000002",
        "username": "manager",
        "password": "manager123",
        "name": "Campus Visit Manager",
        "role": UserRole.MANAGER,
    },
    "security": {
        "id": "u0000000-0000-0000-0000-000000000003",
        "username": "security",
        "password": "security123",
        "name": "Main Gate Security",
        "role": UserRole.SECURITY,
    },
}


def authenticate_user(login_data: LoginRequest) -> Optional[UserInfo]:
    """
    Authenticate a user by checking the Supabase `users` table,
    or falling back to the built-in preset accounts.
    """
    uname = login_data.username.strip().lower()
    pwd = login_data.password.strip()

    # 1. Try checking database users table if it exists
    try:
        resp = (
            supabase.table("users")
            .select("*")
            .eq("username", uname)
            .limit(1)
            .execute()
        )
        if resp.data and len(resp.data) > 0:
            db_user = resp.data[0]
            if db_user.get("password") == pwd:
                return UserInfo(
                    id=str(db_user.get("id")),
                    username=db_user.get("username"),
                    name=db_user.get("name"),
                    role=UserRole(db_user.get("role")),
                )
    except Exception:
        # Fall back to preset accounts if database table is not yet created
        pass

    # 2. Check preset accounts
    if uname in PRESET_ACCOUNTS:
        preset = PRESET_ACCOUNTS[uname]
        if preset["password"] == pwd:
            return UserInfo(
                id=preset["id"],
                username=preset["username"],
                name=preset["name"],
                role=preset["role"],
            )

    return None
