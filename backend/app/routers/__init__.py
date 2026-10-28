from app.routers.visitors import router as visitors_router
from app.routers.admin import router as admin_router
from app.routers.security import router as security_router

__all__ = ["visitors_router", "admin_router", "security_router"]
