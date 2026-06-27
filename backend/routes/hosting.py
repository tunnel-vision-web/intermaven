from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
from config import db
from utils import get_current_user

router = APIRouter(prefix="/api/hosting")

class DomainRegisterRequest(BaseModel):
    domain: str
    years: int = 1

class DNSChangeRequest(BaseModel):
    domain: str
    action: str  # "add" | "delete"
    record_type: str  # "A" | "CNAME" | "MX" | "TXT"
    name: str
    value: str

@router.get("/domains/check")
async def check_domain(domain: str, current_user: dict = Depends(get_current_user)):
    domain = domain.lower().strip()
    if "." not in domain or len(domain) < 4:
        raise HTTPException(status_code=400, detail="Invalid domain format")
    
    # Hashing check: if domain length is even, it's available; otherwise, taken
    is_available = len(domain.split(".")[0]) % 2 == 0
    
    # Determine price based on TLD
    tld = domain.split(".")[-1]
    prices = {
        "com": 10.0,
        "co.ke": 8.0,
        "net": 12.0,
        "io": 25.0,
        "org": 14.0
    }
    price = prices.get(tld, 15.0)

    return {
        "domain": domain,
        "available": is_available,
        "price": price,
        "currency": "USD",
        "credits_cost": int(price * 10)  # 1 USD = 10 credits
    }

@router.get("/domains")
async def get_domains(current_user: dict = Depends(get_current_user)):
    domains = list(db.domains.find({"user_id": current_user["_id"]}))
    
    # Seed a default domain if user has none
    if len(domains) == 0:
        sample_domain = {
            "user_id": current_user["_id"],
            "domain": f"{current_user.get('brand_name', 'creative').lower().replace(' ', '').strip() or 'mybrand'}.co.ke",
            "years": 1,
            "dns_records": [
                {"type": "A", "name": "@", "value": "185.199.108.153"},
                {"type": "CNAME", "name": "www", "value": "domains.intermaven.co"},
                {"type": "MX", "name": "@", "value": "10 mailserver.intermaven.co"}
            ],
            "created_at": datetime.now(timezone.utc)
        }
        db.domains.insert_one(sample_domain)
        domains = [sample_domain]

    # Serialize
    for d in domains:
        d["id"] = str(d["_id"])
        del d["_id"]
        if "user_id" in d:
            d["user_id"] = str(d["user_id"])
            
    return {"domains": domains}

@router.post("/domains/register")
async def register_domain(req: DomainRegisterRequest, current_user: dict = Depends(get_current_user)):
    domain = req.domain.lower().strip()
    check_res = await check_domain(domain, current_user)
    if not check_res["available"]:
        raise HTTPException(status_code=400, detail="Domain is already registered")

    cost = check_res["credits_cost"]
    user_credits = current_user.get("credits", 0)
    if user_credits < cost:
        raise HTTPException(status_code=400, detail=f"Insufficient credits. Requires {cost} credits, you have {user_credits}")

    # Deduct credits
    db.users.update_one(
        {"_id": current_user["_id"]},
        {"$inc": {"credits": -cost}}
    )

    # Register domain
    new_domain = {
        "user_id": current_user["_id"],
        "domain": domain,
        "years": req.years,
        "dns_records": [
            {"type": "A", "name": "@", "value": "185.199.108.153"},
            {"type": "CNAME", "name": "www", "value": "domains.intermaven.co"}
        ],
        "created_at": datetime.now(timezone.utc)
    }
    db.domains.insert_one(new_domain)
    
    # Log transaction
    db.transactions.insert_one({
        "user_id": current_user["_id"],
        "type": "domain_registration",
        "domain": domain,
        "amount": cost,
        "status": "completed",
        "created_at": datetime.now(timezone.utc)
    })

    # Log notification
    db.notifications.insert_one({
        "user_id": current_user["_id"],
        "icon": "🌐",
        "title": "Domain Registered",
        "text": f"Successfully registered custom domain: {domain}. Deducted {cost} credits.",
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })

    return {
        "success": True,
        "message": f"Domain {domain} registered successfully.",
        "credits_deducted": cost
    }

@router.post("/dns/change")
async def change_dns(req: DNSChangeRequest, current_user: dict = Depends(get_current_user)):
    domain_rec = db.domains.find_one({"domain": req.domain, "user_id": current_user["_id"]})
    if not domain_rec:
        raise HTTPException(status_code=404, detail="Domain record not found")

    dns_records = domain_rec.get("dns_records", [])

    if req.action == "add":
        dns_records.append({
            "type": req.record_type.upper(),
            "name": req.name,
            "value": req.value
        })
    elif req.action == "delete":
        dns_records = [
            r for r in dns_records 
            if not (r["type"] == req.record_type.upper() and r["name"] == req.name and r["value"] == req.value)
        ]
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

    db.domains.update_one(
        {"_id": domain_rec["_id"]},
        {"$set": {"dns_records": dns_records}}
    )

    return {"success": True, "dns_records": dns_records}

@router.get("/packages")
async def get_packages():
    return {
        "packages": [
            {
                "id": "starter",
                "name": "Cloud Starter",
                "storage": "10 GB NVMe",
                "databases": "1 Database",
                "bandwidth": "100 GB Bandwidth",
                "monthly_credits": 50,
                "price_usd": 4.99
            },
            {
                "id": "pro",
                "name": "Cloud Professional",
                "storage": "50 GB NVMe",
                "databases": "5 Databases",
                "bandwidth": "Unlimited Bandwidth",
                "monthly_credits": 100,
                "price_usd": 9.99
            },
            {
                "id": "enterprise",
                "name": "Cloud Developer",
                "storage": "Unlimited Storage",
                "databases": "Unlimited Databases",
                "bandwidth": "Unlimited Bandwidth",
                "monthly_credits": 200,
                "price_usd": 19.99
            }
        ]
    }
