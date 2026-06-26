"""
Live FX rates with KES as the base currency.
Rates are fetched from a free, keyless provider and cached in Mongo (`fx_rates`).
A static fallback table guarantees the pricing engine never fails.
"""
import time
import logging
import requests

from config import db

logger = logging.getLogger("intermaven.fx")

# Base currency for the whole platform.
BASE_CURRENCY = "KES"

# Cache lifetime (seconds). Rates refresh roughly every 6 hours.
CACHE_TTL = 6 * 60 * 60

# Keyless provider; returns { result, base_code, rates: {CODE: rate, ...} }
_PROVIDER_URL = f"https://open.er-api.com/v6/latest/{BASE_CURRENCY}"

# Approximate fallback rates (1 KES -> X). Used only if API + cache both fail.
# Values are intentionally conservative; live rates override these in practice.
_FALLBACK_RATES = {
    "KES": 1.0, "USD": 0.0077, "EUR": 0.0071, "GBP": 0.0061, "CAD": 0.0105,
    "AUD": 0.0117, "CHF": 0.0068, "NZD": 0.0128, "AED": 0.0283, "INR": 0.66,
    "JPY": 1.16, "SEK": 0.082, "NOK": 0.083, "DKK": 0.053,
    "UGX": 28.5, "TZS": 20.5, "RWF": 10.8, "BIF": 22.7, "ETB": 0.96,
    "SOS": 4.4, "SSP": 34.0, "SDG": 4.6, "DJF": 1.37, "ERN": 0.115,
    "NGN": 11.8, "GHS": 0.115, "XOF": 4.65, "SLE": 0.176, "LRD": 1.5,
    "GMD": 0.55, "GNF": 66.0, "CVE": 0.78, "XAF": 4.65, "CDF": 22.0,
    "AOA": 7.1, "STN": 0.174, "ZAR": 0.14, "ZMW": 0.21, "MWK": 13.4,
    "MZN": 0.49, "BWP": 0.105, "NAD": 0.14, "ZWL": 0.25, "SZL": 0.14,
    "LSL": 0.14, "MGA": 35.0, "MUR": 0.35, "SCR": 0.105, "KMF": 3.5,
    "MRU": 0.31, "EGP": 0.38, "MAD": 0.077, "DZD": 1.04, "TND": 0.024, "LYD": 0.037,
}

# Simple in-process memo to avoid hitting Mongo every request.
_memo = {"rates": None, "ts": 0}


def _store_rates(rates: dict):
    _memo["rates"] = rates
    _memo["ts"] = time.time()
    if db is not None:
        try:
            db.fx_rates.update_one(
                {"_id": "latest"},
                {"$set": {"base": BASE_CURRENCY, "rates": rates, "updated_at": time.time()}},
                upsert=True,
            )
        except Exception as e:
            logger.warning("Could not persist FX rates: %s", e)


def _load_cached_rates():
    if _memo["rates"] and (time.time() - _memo["ts"] < CACHE_TTL):
        return _memo["rates"], False  # fresh
    if db is not None:
        try:
            doc = db.fx_rates.find_one({"_id": "latest"})
            if doc and doc.get("rates"):
                stale = (time.time() - doc.get("updated_at", 0)) > CACHE_TTL
                _memo["rates"] = doc["rates"]
                _memo["ts"] = doc.get("updated_at", 0)
                return doc["rates"], stale
        except Exception:
            pass
    return None, True


def get_rates() -> dict:
    """Return {currency: rate-from-KES}. Refreshes from API when cache is stale."""
    cached, stale = _load_cached_rates()
    if cached and not stale:
        return cached
    try:
        resp = requests.get(_PROVIDER_URL, timeout=6)
        data = resp.json()
        if data.get("result") == "success" and data.get("rates"):
            rates = data["rates"]
            _store_rates(rates)
            return rates
    except Exception as e:
        logger.warning("FX API fetch failed (%s); using cache/fallback.", e)
    if cached:
        return cached
    return _FALLBACK_RATES


def convert(amount_kes: float, currency: str) -> float:
    """Convert an amount in KES to the target currency using live rates."""
    if currency.upper() == BASE_CURRENCY:
        return float(amount_kes)
    rates = get_rates()
    rate = rates.get(currency.upper())
    if not rate:
        rate = _FALLBACK_RATES.get(currency.upper(), 1.0)
    return float(amount_kes) * float(rate)
