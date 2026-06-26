"""Localized pricing endpoint."""
from fastapi import APIRouter

from regions import get_country, DEFAULT_CURRENCY, CURRENCIES
from pricing import build_pricing

router = APIRouter(prefix="/api/pricing", tags=["pricing"])


@router.get("")
async def get_pricing(currency: str | None = None, country: str | None = None):
    """Return localized plans + tool costs. Resolves currency from explicit
    `currency`, else from `country`, else falls back to base KES."""
    cur = None
    if currency and currency.upper() in CURRENCIES:
        cur = currency.upper()
    elif country:
        cur = get_country(country)["currency"]
    if cur is None:
        cur = DEFAULT_CURRENCY
    return build_pricing(cur)
