from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from config import db
from utils import get_current_user

router = APIRouter(prefix="/api/contracts", tags=["contracts"])


CONTRACT_TEMPLATES: Dict[str, Dict[str, Any]] = {
    "nda": {
        "id": "nda",
        "name": "Non-Disclosure Agreement (NDA)",
        "category": "Confidentiality",
        "description": "Protect confidential business, creative, and technical information shared with partners, vendors, or collaborators.",
        "default_term": "2 years from the Effective Date",
        "clauses": ["Mutual Confidentiality", "Non-Solicitation", "Return/Destruction of Materials", "Injunctive Relief"],
    },
    "work_for_hire": {
        "id": "work_for_hire",
        "name": "Work-for-Hire Agreement",
        "category": "IP & Production",
        "description": "Commission creative, design, software, or audio work with full IP assignment upon payment.",
        "default_term": "Until final deliverable acceptance",
        "clauses": ["Full IP Assignment", "Milestone Payment Schedule", "Revisions & Acceptance", "Independent Contractor Status"],
    },
    "collaboration": {
        "id": "collaboration",
        "name": "Business & Creative Collaboration",
        "category": "Partnership",
        "description": "Define roles, revenue/equity splits, decision-making, and exit terms for joint ventures and co-creations.",
        "default_term": "12 months (auto-renewing)",
        "clauses": ["Revenue & Split Schedule", "Roles & Deliverables", "Joint IP Governance", "Termination & Buyout"],
    },
    "service_agreement": {
        "id": "service_agreement",
        "name": "Client Service / Retainer Agreement",
        "category": "Commercial",
        "description": "Standard commercial agreement for agencies, consultants, and freelancers onboarding paying clients.",
        "default_term": "Monthly / Project-based",
        "clauses": ["Scope of Services", "Invoicing & Late Fees", "Limitation of Liability", "Termination Notice (30 Days)"],
    },
}


class ContractGenerateRequest(BaseModel):
    template_id: str
    title: Optional[str] = None
    party_a_name: str
    party_a_email: Optional[str] = ""
    party_b_name: str
    party_b_email: Optional[str] = ""
    jurisdiction: Optional[str] = "Republic of Kenya"
    effective_date: Optional[str] = None
    compensation: Optional[str] = ""
    scope: Optional[str] = ""
    term: Optional[str] = ""
    selected_clauses: Optional[List[str]] = None
    custom_notes: Optional[str] = ""
    use_ai: bool = False


class ContractUpdateRequest(BaseModel):
    title: Optional[str] = None
    body: Optional[str] = None
    party_a_name: Optional[str] = None
    party_b_name: Optional[str] = None
    jurisdiction: Optional[str] = None


class ContractSignRequest(BaseModel):
    signer_name: str
    signer_role: Optional[str] = "Party A"


def _render_contract_template(req: ContractGenerateRequest, template: Dict[str, Any]) -> str:
    effective = req.effective_date or datetime.now(timezone.utc).strftime("%B %d, %Y")
    term = req.term.strip() if req.term and req.term.strip() else template["default_term"]
    clauses = req.selected_clauses if req.selected_clauses is not None else template["clauses"]
    scope_text = req.scope.strip() if req.scope and req.scope.strip() else (
        "The parties agree to collaborate and execute the deliverables described in the attached Statement of Work."
    )
    comp_text = req.compensation.strip() if req.compensation and req.compensation.strip() else (
        "Compensation and payment milestones shall be as mutually agreed in writing between the Parties."
    )

    lines = [
        f"{template['name'].upper()}",
        "=" * len(template["name"]),
        "",
        f"Effective Date: {effective}",
        f"Governing Law / Jurisdiction: {req.jurisdiction or 'Republic of Kenya'}",
        "",
        "1. PARTIES",
        f"This Agreement is entered into by and between:",
        f"  - First Party (\"Party A\"): {req.party_a_name}" + (f" ({req.party_a_email})" if req.party_a_email else ""),
        f"  - Second Party (\"Party B\"): {req.party_b_name}" + (f" ({req.party_b_email})" if req.party_b_email else ""),
        "",
        "2. PURPOSE & SCOPE",
        scope_text,
        "",
        "3. COMPENSATION & PAYMENT TERMS",
        comp_text,
        "",
        "4. TERM & DURATION",
        f"This Agreement shall remain in effect for: {term}.",
        "",
        "5. STANDARD & SELECTED CLAUSES",
    ]
    for idx, clause in enumerate(clauses, start=1):
        lines.append(f"  5.{idx} {clause}: Both Parties agree to uphold standard commercial obligations governing {clause.lower()} under {req.jurisdiction or 'applicable law'}.")

    if req.custom_notes and req.custom_notes.strip():
        lines.extend([
            "",
            "6. SPECIAL PROVISIONS",
            req.custom_notes.strip(),
        ])

    lines.extend([
        "",
        "SIGNATURES",
        f"Party A: {req.party_a_name} ________________________   Date: ____________",
        f"Party B: {req.party_b_name} ________________________   Date: ____________",
        "",
        "Note: Generated via Intermaven Contract Builder. Review with qualified legal counsel before execution.",
    ])
    return "\n".join(lines)


def _serialize_contract(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "template_id": doc.get("template_id", ""),
        "template_name": doc.get("template_name", ""),
        "title": doc.get("title", ""),
        "party_a_name": doc.get("party_a_name", ""),
        "party_a_email": doc.get("party_a_email", ""),
        "party_b_name": doc.get("party_b_name", ""),
        "party_b_email": doc.get("party_b_email", ""),
        "jurisdiction": doc.get("jurisdiction", ""),
        "status": doc.get("status", "draft"),
        "body": doc.get("body", ""),
        "signatures": doc.get("signatures", []),
        "created_at": doc["created_at"].isoformat() if isinstance(doc.get("created_at"), datetime) else str(doc.get("created_at", "")),
        "updated_at": doc["updated_at"].isoformat() if isinstance(doc.get("updated_at"), datetime) else str(doc.get("updated_at", "")),
    }


@router.get("/templates")
async def list_contract_templates():
    return {"templates": list(CONTRACT_TEMPLATES.values())}


@router.get("")
async def list_contracts(
    status: Optional[str] = None,
    template_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
):
    if db is None:
        return {"contracts": []}
    query: Dict[str, Any] = {"user_id": current_user["_id"]}
    if status and status != "all":
        query["status"] = status
    if template_id and template_id != "all":
        query["template_id"] = template_id
    docs = list(db.contracts.find(query).sort("updated_at", -1).limit(limit))
    return {"contracts": [_serialize_contract(d) for d in docs]}


@router.post("/generate")
async def generate_contract(req: ContractGenerateRequest, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    template = CONTRACT_TEMPLATES.get(req.template_id)
    if not template:
        raise HTTPException(status_code=400, detail="Unknown contract template")

    body = _render_contract_template(req, template)
    if req.use_ai:
        try:
            from llm_fallback import run_llm_completion
            prompt = (
                f"Draft a clear, enforceable {template['name']} governed by {req.jurisdiction}.\n"
                f"Party A: {req.party_a_name}\nParty B: {req.party_b_name}\n"
                f"Scope: {req.scope or 'Standard commercial scope'}\n"
                f"Compensation: {req.compensation or 'As agreed'}\n"
                f"Term: {req.term or template['default_term']}\n"
                f"Include clauses: {', '.join(req.selected_clauses or template['clauses'])}\n"
                f"Custom notes: {req.custom_notes or 'None'}\n"
                "Format cleanly in plain text with numbered sections and signature blocks."
            )
            ai_body = await run_llm_completion(
                prompt=prompt,
                system_message="You are a commercial contracts drafter. Produce structured, plain-text business agreements.",
                session_id=f"contract-{current_user['_id']}-{req.template_id}",
            )
            if ai_body and len(ai_body.strip()) > 100:
                body = ai_body.strip()
        except Exception:
            pass

    now = datetime.now(timezone.utc)
    title = (req.title or "").strip() or f"{template['name']} — {req.party_b_name}"
    doc = {
        "user_id": current_user["_id"],
        "template_id": req.template_id,
        "template_name": template["name"],
        "title": title,
        "party_a_name": req.party_a_name.strip(),
        "party_a_email": (req.party_a_email or "").strip(),
        "party_b_name": req.party_b_name.strip(),
        "party_b_email": (req.party_b_email or "").strip(),
        "jurisdiction": (req.jurisdiction or "Republic of Kenya").strip(),
        "status": "draft",
        "body": body,
        "signatures": [],
        "created_at": now,
        "updated_at": now,
    }
    res = db.contracts.insert_one(doc)
    doc["_id"] = res.inserted_id
    return {"success": True, "contract": _serialize_contract(doc)}


@router.put("/{contract_id}")
async def update_contract(contract_id: str, payload: ContractUpdateRequest, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        oid = ObjectId(contract_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid contract ID")

    updates: Dict[str, Any] = {"updated_at": datetime.now(timezone.utc)}
    for field in ("title", "body", "party_a_name", "party_b_name", "jurisdiction"):
        val = getattr(payload, field)
        if val is not None:
            updates[field] = val

    doc = db.contracts.find_one_and_update(
        {"_id": oid, "user_id": current_user["_id"]},
        {"$set": updates},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "contract": _serialize_contract(doc)}


@router.post("/{contract_id}/sign")
async def sign_contract(contract_id: str, payload: ContractSignRequest, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        oid = ObjectId(contract_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid contract ID")

    now = datetime.now(timezone.utc)
    sig = {
        "signer_name": payload.signer_name.strip(),
        "signer_role": payload.signer_role or "Party A",
        "signed_at": now.isoformat(),
    }
    doc = db.contracts.find_one_and_update(
        {"_id": oid, "user_id": current_user["_id"]},
        {"$push": {"signatures": sig}, "$set": {"status": "signed", "updated_at": now}},
        return_document=True,
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "contract": _serialize_contract(doc)}


@router.delete("/{contract_id}")
async def delete_contract(contract_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable.")
    try:
        oid = ObjectId(contract_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid contract ID")

    res = db.contracts.delete_one({"_id": oid, "user_id": current_user["_id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True}
