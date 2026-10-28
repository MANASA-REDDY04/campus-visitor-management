import uuid
from fastapi import APIRouter, HTTPException, status
from app.schemas.auth import LoginRequest, LoginResponse, UserInfo
from app.services.auth_service import authenticate_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest):
    user = authenticate_user(payload)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    # Generate simple session token
    token = f"cbit-auth-{uuid.uuid4().hex[:16]}"
    return LoginResponse(
        success=True,
        message=f"Welcome back, {user.name}!",
        user=user,
        token=token,
    )
