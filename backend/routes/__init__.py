from .auth import router as auth_router
from .user import router as user_router, apps_router
from .files import router as files_router
from .folders import router as folders_router
from .payments import router as payments_router
from .epk import epk_router
from .notifications import router as notifications_router
from .ai import router as ai_router
from .public import router as public_router
from .crm import router as crm_router
from .admin import router as admin_router
from .geo import router as geo_router
from .pricing import router as pricing_router
from .sso import router as sso_router
from .wizard import router as wizard_router
from .strategies import router as strategies_router

__all__ = [
    "auth_router",
    "user_router",
    "apps_router",
    "files_router",
    "folders_router",
    "payments_router",
    "epk_router",
    "notifications_router",
    "ai_router",
    "public_router",
    "crm_router",
    "admin_router",
    "geo_router",
    "pricing_router",
    "sso_router",
    "wizard_router",
    "strategies_router",
]
