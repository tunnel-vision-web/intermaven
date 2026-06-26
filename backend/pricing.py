"""
Pricing engine. Canonical prices are stored in KES and converted + rounded
to the user's currency at request time. Western currencies use .99 endings;
others round up to a clean, solid number.
"""
import math

import fx
from regions import get_currency_info

# Canonical plan/pack prices in KES (base currency).
PLANS = [
    {
        "id": "free",
        "name": "Free starter",
        "kes": 0,
        "credits": "150 free credits",
        "billing": "",
        "popular": False,
        "cta": "Start free — no card needed",
        "features": [
            "All AI tools (limited runs)",
            "Social AI — 2 accounts",
            "Copy & download results",
            "Credits valid for 90 days",
        ],
    },
    {
        "id": "creator",
        "name": "Creator pack",
        "kes": 500,
        "credits": "600 credits • ~40 full runs",
        "billing": "one-time",
        "popular": True,
        "cta": "Buy now →",
        "features": [
            "Everything in Free",
            "Social AI — 6 accounts",
            "Priority AI generation speed",
            "Save & organise outputs",
            "Credits never expire",
        ],
    },
    {
        "id": "pro",
        "name": "Pro bundle",
        "kes": 1500,
        "credits": "2,500 credits • ~165 full runs",
        "billing": "one-time",
        "popular": False,
        "cta": "Buy now →",
        "features": [
            "Everything in Creator",
            "Unlimited Social AI accounts",
            "White-label output",
            "API access (beta)",
            "Priority WhatsApp support",
            "Credits never expire",
        ],
    },
]

# Per-run tool costs in KES (Creator-tier credit value).
TOOL_COSTS = [
    {"icon": "brandkit", "color": "#c084fc", "name": "Brand Kit AI", "credits": "10 credits per run", "kes": 8.3},
    {"icon": "musicbio", "color": "#22d3ee", "name": "Music Bio & Press Kit", "credits": "15 credits per run", "kes": 12.5},
    {"icon": "social", "color": "#f43f5e", "name": "Social AI", "credits": "Free — 0 credits", "kes": 0, "always_free": True},
    {"icon": "syncpitch", "color": "#f59e0b", "name": "Sync Pitch AI", "credits": "20 credits per run", "kes": 16.7},
    {"icon": "pitchdeck", "color": "#8b5cf6", "name": "Pitch Deck AI", "credits": "18 credits per run", "kes": 15.0},
]


def _round_ninety_nine(value: float) -> float:
    """Round UP to the next X.99 price point (e.g. 5.42 -> 5.99, 6.01 -> 6.99)."""
    if value <= 0:
        return 0.0
    base = math.floor(value)
    candidate = base + 0.99
    if candidate < value - 1e-9:
        candidate = base + 1 + 0.99
    return round(candidate, 2)


def _round_clean(value: float) -> float:
    """Round UP to a clean, solid whole number depending on magnitude."""
    if value <= 0:
        return 0.0
    if value < 100:
        step = 10
    elif value < 1000:
        step = 50
    elif value < 10000:
        step = 100
    elif value < 100000:
        step = 500
    else:
        step = 1000
    return float(math.ceil(value / step) * step)


def round_price(value: float, currency: str) -> float:
    info = get_currency_info(currency)
    if info["rounding"] == "ninety_nine":
        return _round_ninety_nine(value)
    return _round_clean(value)


def format_price(value: float, currency: str) -> str:
    info = get_currency_info(currency)
    if info["decimals"] == 0:
        num = f"{int(round(value)):,}"
    else:
        num = f"{value:,.2f}"
    sym = info["symbol"]
    # Pure symbols ($, €, £, ₦) hug the number; alphabetic codes get a space.
    alpha = any(ch.isalpha() for ch in sym)
    if info["pos"] == "after":
        return f"{num} {sym}" if alpha else f"{num}{sym}"
    return f"{sym} {num}" if alpha else f"{sym}{num}"


def price_in(amount_kes: float, currency: str, do_round: bool = True) -> dict:
    converted = fx.convert(amount_kes, currency)
    final = round_price(converted, currency) if do_round else round(converted, 2)
    return {"amount": final, "display": format_price(final, currency)}


def build_pricing(currency: str) -> dict:
    info = get_currency_info(currency)
    plans = []
    for p in PLANS:
        priced = price_in(p["kes"], currency) if p["kes"] > 0 else {"amount": 0, "display": format_price(0, currency)}
        plans.append({
            "id": p["id"], "name": p["name"], "credits": p["credits"],
            "billing": p["billing"], "popular": p["popular"], "cta": p["cta"],
            "features": p["features"],
            "price": priced["display"], "price_amount": priced["amount"],
        })
    tools = []
    for t in TOOL_COSTS:
        if t.get("always_free"):
            disp = "Always free"
        else:
            # micro per-run costs: convert without psychological rounding
            disp = price_in(t["kes"], currency, do_round=False)["display"] + " on Creator"
        tools.append({
            "icon": t["icon"], "color": t["color"], "name": t["name"],
            "credits": t["credits"], "price": disp, "always_free": t.get("always_free", False),
        })
    return {
        "currency": currency.upper(),
        "currency_symbol": info["symbol"],
        "currency_name": info["name"],
        "plans": plans,
        "tools": tools,
    }
