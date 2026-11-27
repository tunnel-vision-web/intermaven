from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
import secrets

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from config import db
from utils import get_current_user

router = APIRouter(prefix="/api/invoices", tags=["invoices"])


class InvoiceItem(BaseModel):
    description: str
    qty: float = Field(1, gt=0)
    unit_price: float = Field(0, ge=0)


class InvoiceCreate(BaseModel):
    client_name: str
    client_email: Optional[str] = ""
    currency: str = "KES"
    due_date: Optional[str] = ""
    items: List[InvoiceItem]
    tax_rate: float = Field(0, ge=0, le=100)
    payment_method: str = "pesapal"
    notes: Optional[str] = ""


class InvoiceStatusUpdate(BaseModel):
    status: str  # draft | sent | paid | overdue


def _serialize_invoice(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "invoice_number": doc.get("invoice_number", ""),
        "client_name": doc.get("client_name", ""),
        "client_email": doc.get("client_email", ""),
        "currency": doc.get("currency", "KES"),
        "due_date": doc.get("due_date", ""),
        "items": doc.get("items", []),
        "subtotal": doc.get("subtotal", 0),
        "tax_rate": doc.get("tax_rate", 0),
        "tax_amount": doc.get("tax_amount", 0),
        "total": doc.get("total", 0),
        "payment_method": doc.get("payment_method", "pesapal"),
        "payment_link": doc.get("payment_link", ""),
        "status": doc.get("status", "draft"),
        "notes": doc.get("notes", ""),
        "paid_at": doc["paid_at"].isoformat() if isinstance(doc.get("paid_at"), datetime) else doc.get("paid_at"),
        "created_at": doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", "")),
    }


@router.get("")
async def list_invoices(
    status: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    if db is None:
        return {"invoices": [], "summary": {"total_billed": 0, "total_paid": 0, "total_outstanding": 0}}

    query: Dict[str, Any] = {"user_id": current_user["_id"]}
    if status and status != "all":
        query["status"] = status

    docs = list(db.invoices.find(query).sort("created_at", -1).limit(limit))
    invoices = [_serialize_invoice(d) for d in docs]

    all_docs = list(db.invoices.find({"user_id": current_user["_id"]}))
    total_billed = round(sum(float(d.get("total", 0)) for d in all_docs), 2)
    total_paid = round(sum(float(d.get("total", 0)) for d in all_docs if d.get("status") == "paid"), 2)
    total_outstanding = round(total_billed - total_paid, 2)

    return {
        "invoices": invoices,
        "summary": {
            "total_billed": total_billed,
            "total_paid": total_paid,
            "total_outstanding": total_outstanding,
        },
    }


@router.post("")
async def create_invoice(payload: InvoiceCreate, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    if not payload.items:
        raise HTTPException(status_code=400, detail="At least one line item is required.")

    items_data = []
    subtotal = 0.0
    for it in payload.items:
        line_total = round(it.qty * it.unit_price, 2)
        subtotal += line_total
        items_data.append({
            "description": it.description.strip(),
            "qty": it.qty,
            "unit_price": it.unit_price,
            "line_total": line_total,
        })

    subtotal = round(subtotal, 2)
    tax_amount = round(subtotal * (payload.tax_rate / 100.0), 2)
    total = round(subtotal + tax_amount, 2)

    now = datetime.now(timezone.utc)
    share_token = secrets.token_urlsafe(12)
    invoice_number = f"INV-{now.strftime('%Y%m%d')}-{secrets.token_hex(2).upper()}"
    doc = {
        "user_id": current_user["_id"],
        "invoice_number": invoice_number,
        "client_name": payload.client_name.strip(),
        "client_email": (payload.client_email or "").strip(),
        "currency": payload.currency.upper(),
        "due_date": payload.due_date or "",
        "items": items_data,
        "subtotal": subtotal,
        "tax_rate": payload.tax_rate,
        "tax_amount": tax_amount,
        "total": total,
        "payment_method": payload.payment_method,
        "share_token": share_token,
        "payment_link": f"https://intermaven.io/pay/{share_token}",
        "status": "draft",
        "notes": (payload.notes or "").strip(),
        "paid_at": None,
        "created_at": now,
        "updated_at": now,
    }
    res = db.invoices.insert_one(doc)
    doc["_id"] = res.inserted_id
    return {"success": True, "invoice": _serialize_invoice(doc)}


@router.patch("/{invoice_id}/status")
async def update_invoice_status(invoice_id: str, payload: InvoiceStatusUpdate, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    if payload.status not in {"draft", "sent", "paid", "overdue"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    try:
        oid = ObjectId(invoice_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid invoice ID")

    now = datetime.now(timezone.utc)
    updates: Dict[str, Any] = {"status": payload.status, "updated_at": now}
    if payload.status == "paid":
        updates["paid_at"] = now

    doc = db.invoices.find_one_and_update(
        {"_id": oid, "user_id": current_user["_id"]},
        {"$set": updates},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"success": True, "invoice": _serialize_invoice(doc)}


@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        oid = ObjectId(invoice_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid invoice ID")

    res = db.invoices.delete_one({"_id": oid, "user_id": current_user["_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"success": True}
