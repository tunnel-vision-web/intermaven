from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timezone
import os
import json
import uuid
from dotenv import load_dotenv

# region agent log
def _debug_log(hypothesis_id: str, location: str, message: str, data: dict):
    try:
        with open("debug-ef0398.log", "a", encoding="utf-8") as _f:
            _f.write(json.dumps({
                "sessionId": "ef0398",
                "runId": os.environ.get("RENDER_GIT_COMMIT", "local"),
                "hypothesisId": hypothesis_id,
                "id": f"log_{uuid.uuid4().hex}",
                "location": location,
                "message": message,
                "data": data,
                "timestamp": int(datetime.now(timezone.utc).timestamp() * 1000),
            }) + "\n")
    except Exception:
        pass
# endregion

# region agent log
_debug_log(
    "H2",
    "backend/server.py:import-bootstrap",
    "Server import bootstrap context",
    {"cwd": os.getcwd(), "pythonpath": os.environ.get("PYTHONPATH", ""), "port": os.environ.get("PORT", "")},
)
# endregion

try:
    from config import logger
    from routes import (
        auth_router, user_router, apps_router, files_router, folders_router,
        payments_router, epk_router, notifications_router, ai_router,
        public_router, crm_router, admin_router,
    )
    # region agent log
    _debug_log("H1", "backend/server.py:import-mode", "Imported local modules using root-style imports", {"mode": "root-style"})
    # endregion
except ModuleNotFoundError as import_err:
    # region agent log
    _debug_log("H1", "backend/server.py:import-mode-fallback", "Root-style imports failed; trying package-style imports", {"error": str(import_err)})
    # endregion
    from backend.config import logger
    from backend.routes import (
        auth_router, user_router, apps_router, files_router, folders_router,
        payments_router, epk_router, notifications_router, ai_router,
        public_router, crm_router, admin_router,
    )
    # region agent log
    _debug_log("H1", "backend/server.py:import-mode-fallback-success", "Package-style imports succeeded", {"mode": "package-style"})
    # endregion

load_dotenv()

app = FastAPI(title="Intermaven API", version="1.0.0")

# CORS: allow frontend origin explicitly (React dev server on port 3000)
# Ensure frontend .env has REACT_APP_BACKEND_URL=http://localhost:8001
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,   # Must be False when allow_origins=["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Cross-Origin-Resource-Policy"] = "same-origin"
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    return response

@app.exception_handler(Exception)
async def log_exceptions(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url)
    # CRITICAL: include CORS headers on error responses so browsers don't mask
    # backend 500s as CORS failures. Starlette skips CORSMiddleware for
    # exception_handler responses, so we add the headers manually here.
    origin = request.headers.get("origin", "*")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "false",
            "Vary": "Origin",
        },
    )


@app.get("/api/health/db")
async def health_db():
    """Diagnostic: confirms the MongoDB connection is alive. Returns 503 if down."""
    try:
        from config import db as _db
    except Exception:
        from backend.config import db as _db
    if _db is None:
        from fastapi.responses import JSONResponse as _JR
        return _JR(status_code=503, content={"status": "db_unavailable", "detail": "MongoDB connection failed at startup. Check MONGO_URL env var and Atlas IP whitelist."})
    try:
        _db.command("ping")
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        from fastapi.responses import JSONResponse as _JR
        return _JR(status_code=503, content={"status": "db_unavailable", "detail": str(e)})

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(apps_router)
app.include_router(files_router)
app.include_router(folders_router)
app.include_router(payments_router)
app.include_router(epk_router)
app.include_router(notifications_router)
app.include_router(ai_router)
app.include_router(public_router)
app.include_router(crm_router)
app.include_router(admin_router)

# ============== HEALTH CHECK ==============

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Intermaven API"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)

