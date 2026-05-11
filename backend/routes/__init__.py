from .auth import router as auth_router
from .user import router as user_router
from .files import router as files_router
from .folders import router as folders_router
from .payments import router as payments_router
from .epk import epk_router
from .notifications import router as notifications_router

__all__ = [
    "auth_router",
    "user_router",
    "files_router",
    "folders_router",
    "payments_router",
    "epk_router",
    "notifications_router",
]