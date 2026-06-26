"""Geolocation + region resolution endpoints."""
import logging
import requests
from fastapi import APIRouter, Request

from regions import (
    COUNTRIES, CURRENCIES, LANGUAGES,
    get_country, get_currency_info, languages_for_country,
    DEFAULT_COUNTRY, DEFAULT_CURRENCY, DEFAULT_LANGUAGE,
)

router = APIRouter(prefix="/api/geo", tags=["geo"])
logger = logging.getLogger("intermaven.geo")


def _client_ip(request: Request) -> str | None:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        ip = fwd.split(",")[0].strip()
        if ip:
            return ip
    cf = request.headers.get("cf-connecting-ip")
    if cf:
        return cf
    if request.client:
        return request.client.host
    return None


def _is_private(ip: str) -> bool:
    return (
        ip is None or ip.startswith(("10.", "192.168.", "127.", "172.16.", "172.17.",
                                     "172.18.", "172.19.", "172.20.", "::1")) or ip == "localhost"
    )


def _detect_country(request: Request) -> str | None:
    # Trust an explicit CDN country header first (e.g. Cloudflare).
    cf_country = request.headers.get("cf-ipcountry")
    if cf_country and cf_country.upper() in COUNTRIES:
        return cf_country.upper()
    ip = _client_ip(request)
    if _is_private(ip):
        return None
    try:
        resp = requests.get(f"http://ip-api.com/json/{ip}?fields=status,countryCode", timeout=4)
        data = resp.json()
        if data.get("status") == "success":
            cc = data.get("countryCode", "").upper()
            if cc in COUNTRIES:
                return cc
    except Exception as e:
        logger.warning("IP geolocation failed: %s", e)
    return None


@router.get("/resolve")
async def resolve_region(request: Request, country: str | None = None):
    """Resolve the visitor's region. `country` query param overrides detection."""
    source = "default"
    cc = None
    if country and country.upper() in COUNTRIES:
        cc = country.upper()
        source = "override"
    if cc is None:
        detected = _detect_country(request)
        if detected:
            cc = detected
            source = "ip"
    if cc is None:
        cc = DEFAULT_COUNTRY
    info = get_country(cc)
    currency = info["currency"]
    langs = languages_for_country(cc)
    return {
        "country": cc,
        "country_name": info["name"],
        "currency": currency,
        "currency_info": {"code": currency, **get_currency_info(currency)},
        "languages": langs,
        "default_language": langs[0]["code"] if langs else DEFAULT_LANGUAGE,
        "source": source,
    }


@router.get("/options")
async def region_options():
    """Full lists for the region/currency/language switcher UI."""
    countries = [
        {"code": code, "name": c["name"], "currency": c["currency"]}
        for code, c in sorted(COUNTRIES.items(), key=lambda kv: kv[1]["name"])
    ]
    currencies = [
        {"code": code, "symbol": c["symbol"], "name": c["name"]}
        for code, c in sorted(CURRENCIES.items(), key=lambda kv: kv[1]["name"])
    ]
    languages = [{"code": code, **info} for code, info in LANGUAGES.items()]
    return {"countries": countries, "currencies": currencies, "languages": languages}
