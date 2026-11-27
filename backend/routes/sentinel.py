"""Portable Sentinel AI Testing Agent Router.

Designed to be mounted on any platform backend in the Intermaven / TuneMavens
ecosystem (Intermaven, TuneMavens, TuneStream, SyncMavens). Supports both
in-process ASGI self-checks ("local") and remote staging/production URL checks.
"""
from datetime import datetime, timezone
import time
from typing import Any, Dict, List, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from config import db
from utils import get_current_user

router = APIRouter(prefix="/api/admin/test-agent", tags=["sentinel"])


PLATFORM_CATALOG: Dict[str, Dict[str, Any]] = {
    "intermaven": {
        "id": "intermaven",
        "name": "Intermaven Core",
        "default_url": "local",
        "live_url": "https://intermaven.onrender.com",
        "checks": [
            {"name": "API Health", "method": "GET", "path": "/api/health", "auth": False, "expect": [200]},
            {"name": "Geo Resolve", "method": "GET", "path": "/api/geo/resolve?country=KE", "auth": False, "expect": [200]},
            {"name": "Localized Pricing", "method": "GET", "path": "/api/pricing?currency=USD&country=US", "auth": False, "expect": [200]},
            {"name": "Mother-CMS Bulk", "method": "GET", "path": "/api/cms/bulk/lookup?keys=pricing.callout.title&region=KE&portal=music", "auth": False, "expect": [200]},
            {"name": "Auth /me", "method": "GET", "path": "/api/auth/me", "auth": True, "expect": [200]},
            {"name": "AI Output Library", "method": "GET", "path": "/api/ai/outputs", "auth": True, "expect": [200]},
            {"name": "Contract Templates", "method": "GET", "path": "/api/contracts/templates", "auth": False, "expect": [200]},
            {"name": "Invoices Summary", "method": "GET", "path": "/api/invoices", "auth": True, "expect": [200]},
            {"name": "Distro 181 Outlets", "method": "GET", "path": "/api/distro/outlets", "auth": True, "expect": [200]},
            {"name": "Events Network", "method": "GET", "path": "/api/events", "auth": True, "expect": [200]},
            {"name": "Grant Finder", "method": "GET", "path": "/api/grants", "auth": True, "expect": [200]},
            {"name": "Content Calendar", "method": "GET", "path": "/api/social-ai/scheduled", "auth": True, "expect": [200]},
            {"name": "SEO Public Bundle", "method": "GET", "path": "/api/seo/public", "auth": False, "expect": [200]},
            {"name": "XML Sitemap", "method": "GET", "path": "/api/seo/sitemap.xml", "auth": False, "expect": [200]},
        ],
    },
    "tunemavens": {
        "id": "tunemavens",
        "name": "TuneMavens Portal",
        "default_url": "https://tunemavens.com",
        "live_url": "https://tunemavens.com",
        "checks": [
            {"name": "Portal Reachability", "method": "GET", "path": "/api/health", "auth": False, "expect": [200, 404]},
            {"name": "Distro Pipeline", "method": "GET", "path": "/api/distro/outlets", "auth": True, "expect": [200]},
            {"name": "Events Network", "method": "GET", "path": "/api/events", "auth": True, "expect": [200]},
        ],
    },
    "tunestream": {
        "id": "tunestream",
        "name": "TuneStream",
        "default_url": "https://tunestream.co",
        "live_url": "https://tunestream.co",
        "checks": [
            {"name": "Service Health", "method": "GET", "path": "/api/health", "auth": False, "expect": [200, 404]},
        ],
    },
    "syncmavens": {
        "id": "syncmavens",
        "name": "SyncMavens",
        "default_url": "https://syncmavens.com",
        "live_url": "https://syncmavens.com",
        "checks": [
            {"name": "Service Health", "method": "GET", "path": "/api/health", "auth": False, "expect": [200, 404]},
        ],
    },
}

DEFAULT_PERSONAS = ["free_creator", "pro_business", "music_label", "admin"]


def _require_admin(current_user: dict) -> None:
    admin_roles = {"super_admin", "admin", "support", "finance"}
    if not (
        current_user.get("is_admin")
        or current_user.get("role") == "admin"
        or current_user.get("admin_role") in admin_roles
    ):
        raise HTTPException(status_code=403, detail="Admin access required")


class SentinelRunRequest(BaseModel):
    platform: str = "intermaven"
    target_url: Optional[str] = "local"
    personas: Optional[List[str]] = None


def _serialize_run(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "platform": doc.get("platform", "intermaven"),
        "target_url": doc.get("target_url", "local"),
        "personas": doc.get("personas", []),
        "total": doc.get("total", 0),
        "passed": doc.get("passed", 0),
        "failed": doc.get("failed", 0),
        "duration_ms": doc.get("duration_ms", 0),
        "regression_diff": doc.get("regression_diff", 0),
        "results": doc.get("results", []),
        "triggered_by": doc.get("triggered_by", ""),
        "created_at": doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", "")),
    }


@router.get("/platforms")
async def list_sentinel_platforms(current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    return {
        "platforms": [
            {
                "id": p["id"],
                "name": p["name"],
                "default_url": p["default_url"],
                "live_url": p["live_url"],
                "check_count": len(p["checks"]),
            }
            for p in PLATFORM_CATALOG.values()
        ],
        "personas": DEFAULT_PERSONAS,
    }


@router.get("/runs")
async def list_sentinel_runs(limit: int = 20, current_user: dict = Depends(get_current_user)):
    _require_admin(current_user)
    if db is None:
        return {"runs": []}
    docs = list(db.test_runs.find({}).sort("created_at", -1).limit(min(limit, 50)))
    return {"runs": [_serialize_run(d) for d in docs]}


@router.post("/run")
async def run_sentinel_suite(
    payload: SentinelRunRequest,
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    _require_admin(current_user)
    platform_cfg = PLATFORM_CATALOG.get(payload.platform)
    if not platform_cfg:
        raise HTTPException(status_code=400, detail="Unknown platform")

    target_url = (payload.target_url or platform_cfg["default_url"]).strip()
    personas = payload.personas or DEFAULT_PERSONAS
    auth_header = request.headers.get("authorization", "")
    headers = {"Authorization": auth_header} if auth_header else {}

    started = time.perf_counter()
    results: List[Dict[str, Any]] = []

    if target_url in ("local", "self", ""):
        transport = httpx.ASGITransport(app=request.app)
        async with httpx.AsyncClient(transport=transport, base_url="http://sentinel.local", timeout=10.0) as client:
            for chk in platform_cfg["checks"]:
                t0 = time.perf_counter()
                try:
                    resp = await client.request(chk["method"], chk["path"], headers=headers if chk["auth"] else {})
                    ok = resp.status_code in chk["expect"]
                    results.append({
                        "name": chk["name"],
                        "path": chk["path"],
                        "status_code": resp.status_code,
                        "passed": ok,
                        "latency_ms": round((time.perf_counter() - t0) * 1000, 1),
                        "error": "" if ok else f"Unexpected HTTP {resp.status_code}",
                    })
                except Exception as exc:
                    results.append({
                        "name": chk["name"],
                        "path": chk["path"],
                        "status_code": 0,
                        "passed": False,
                        "latency_ms": round((time.perf_counter() - t0) * 1000, 1),
                        "error": str(exc),
                    })
    else:
        base = target_url.rstrip("/")
        async with httpx.AsyncClient(base_url=base, timeout=10.0, follow_redirects=True) as client:
            for chk in platform_cfg["checks"]:
                t0 = time.perf_counter()
                try:
                    resp = await client.request(chk["method"], chk["path"], headers=headers if chk["auth"] else {})
                    ok = resp.status_code in chk["expect"]
                    results.append({
                        "name": chk["name"],
                        "path": chk["path"],
                        "status_code": resp.status_code,
                        "passed": ok,
                        "latency_ms": round((time.perf_counter() - t0) * 1000, 1),
                        "error": "" if ok else f"Unexpected HTTP {resp.status_code}",
                    })
                except Exception as exc:
                    results.append({
                        "name": chk["name"],
                        "path": chk["path"],
                        "status_code": 0,
                        "passed": False,
                        "latency_ms": round((time.perf_counter() - t0) * 1000, 1),
                        "error": str(exc),
                    })

    passed = sum(1 for r in results if r["passed"])
    failed = len(results) - passed
    duration_ms = round((time.perf_counter() - started) * 1000, 1)

    regression_diff = 0
    if db is not None:
        prev = db.test_runs.find_one({"platform": payload.platform}, sort=[("created_at", -1)])
        if prev:
            regression_diff = passed - int(prev.get("passed", 0))

        doc = {
            "platform": payload.platform,
            "target_url": target_url,
            "personas": personas,
            "total": len(results),
            "passed": passed,
            "failed": failed,
            "duration_ms": duration_ms,
            "regression_diff": regression_diff,
            "results": results,
            "triggered_by": current_user.get("email", "admin"),
            "created_at": datetime.now(timezone.utc),
        }
        res = db.test_runs.insert_one(doc)
        doc["_id"] = res.inserted_id
        return {"success": True, "run": _serialize_run(doc)}

    return {
        "success": True,
        "run": {
            "id": "ephemeral",
            "platform": payload.platform,
            "target_url": target_url,
            "personas": personas,
            "total": len(results),
            "passed": passed,
            "failed": failed,
            "duration_ms": duration_ms,
            "regression_diff": 0,
            "results": results,
            "triggered_by": current_user.get("email", "admin"),
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    }
