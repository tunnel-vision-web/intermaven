from .auth import router as auth_router
from .user import router as user_router
from .files import router as files_router
from .folders import router as folders_router

__all__ = [
    "auth_router",
    "user_router",
    "files_router",
    "folders_router",
]
