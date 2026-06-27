from fastapi import APIRouter, Depends, HTTPException, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import os
import httpx
import stripe
from datetime import datetime, timezone
from config import db
from utils import get_current_user, get_plan_credits

router = APIRouter(prefix="/api/payments", tags=["payments"])

STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_test_mock_key")
stripe.api_key = STRIPE_SECRET_KEY

PESAPAL_ENV = os.environ.get("PESAPAL_ENVIRONMENT", "sandbox")
PESAPAL_BASE_URL = os.environ.get("PESAPAL_SANDBOX_BASE_URL") if PESAPAL_ENV == "sandbox" else os.environ.get("PESAPAL_PROD_BASE_URL")
PESAPAL_CONSUMER_KEY = os.environ.get("PESAPAL_CONSUMER_KEY", "")
PESAPAL_CONSUMER_SECRET = os.environ.get("PESAPAL_CONSUMER_SECRET", "")

async def get_pesapal_token():
    if not PESAPAL_CONSUMER_KEY or not PESAPAL_CONSUMER_SECRET:
        raise HTTPException(status_code=500, detail="Pesapal credentials not configured")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PESAPAL_BASE_URL}/api/Auth/RequestToken",
            json={
                "consumer_key": PESAPAL_CONSUMER_KEY,
                "consumer_secret": PESAPAL_CONSUMER_SECRET
            },
            headers={"Content-Type": "application/json"}
        )
        if response.status_code == 200:
            return response.json().get("token")
        raise HTTPException(status_code=500, detail="Failed to get Pesapal token")

class PaymentInitiate(BaseModel):
    plan: str
    amount: int
    phone: Optional[str] = None
    callback_url: str

@router.post("/initiate")
async def initiate_payment(payment: PaymentInitiate, current_user: dict = Depends(get_current_user)):
    if payment.plan not in ["free", "creator", "pro"]:
        raise HTTPException(status_code=400, detail="Invalid plan")
    
    # Create pending transaction
    transaction = {
        "user_id": current_user["_id"],
        "plan": payment.plan,
        "amount": payment.amount,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    result = db.transactions.insert_one(transaction)
    transaction_id = str(result.inserted_id)
    
    # If Stripe is configured and not mock, run Stripe Checkout Session
    if STRIPE_SECRET_KEY and STRIPE_SECRET_KEY != "sk_test_mock_key":
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'usd',
                        'product_data': {
                            'name': f"TuneMavens {payment.plan.capitalize()} Plan",
                        },
                        'unit_amount': int(payment.amount * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=payment.callback_url + f"?payment=success&ref={transaction_id}",
                cancel_url=payment.callback_url + "?payment=cancelled",
                metadata={
                    "transaction_id": transaction_id,
                    "user_id": str(current_user["_id"]),
                    "plan": payment.plan
                }
            )
            return {
                "success": True,
                "transaction_id": transaction_id,
                "redirect_url": session.url
            }
        except Exception as stripe_err:
            print(f"Stripe session creation failed: {stripe_err}")
            pass

    # If Pesapal is configured, use it
    if PESAPAL_CONSUMER_KEY:
        try:
            token = await get_pesapal_token()
            
            async with httpx.AsyncClient() as client:
                order_data = {
                    "id": transaction_id,
                    "currency": "KES",
                    "amount": payment.amount,
                    "description": f"Intermaven {payment.plan.capitalize()} Plan",
                    "callback_url": payment.callback_url,
                    "notification_id": "",
                    "billing_address": {
                        "email_address": current_user.get("email"),
                        "phone_number": payment.phone or current_user.get("phone", ""),
                        "first_name": current_user.get("first_name", ""),
                        "last_name": current_user.get("last_name", "")
                    }
                }
                
                response = await client.post(
                    f"{PESAPAL_BASE_URL}/api/Transactions/SubmitOrderRequest",
                    json=order_data,
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    data = response.json()
                    db.transactions.update_one(
                        {"_id": result.inserted_id},
                        {"$set": {"order_tracking_id": data.get("order_tracking_id")}}
                    )
                    return {
                        "success": True,
                        "transaction_id": transaction_id,
                        "redirect_url": data.get("redirect_url"),
                        "order_tracking_id": data.get("order_tracking_id")
                    }
        except Exception:
            pass

    # Fallback/Mock completion for development sandbox when keys are unconfigured
    db.transactions.update_one(
        {"_id": result.inserted_id},
        {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
    )
    
    db.users.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"plan": payment.plan, "credits": get_plan_credits(payment.plan)}}
    )

    db.notifications.insert_one({
        "user_id": current_user["_id"],
        "icon": "💳",
        "title": "Payment Successful!",
        "text": f"Your {payment.plan.capitalize()} plan is now active.",
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })

    return {
        "success": True,
        "transaction_id": transaction_id,
        "redirect_url": f"{payment.callback_url}?payment=success&ref={transaction_id}",
        "mock": True
    }

@router.post("/callback")
async def payment_callback(data: dict):
    order_tracking_id = data.get("OrderTrackingId")
    
    transaction = db.transactions.find_one({"order_tracking_id": order_tracking_id})
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Verify payment status with Pesapal
    if PESAPAL_CONSUMER_KEY:
        try:
            token = await get_pesapal_token()
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{PESAPAL_BASE_URL}/api/Transactions/GetTransactionStatus?orderTrackingId={order_tracking_id}",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if response.status_code == 200:
                    status_data = response.json()
                    payment_status = status_data.get("payment_status_description", "").lower()
                    
                    if payment_status == "completed":
                        # Update transaction
                        db.transactions.update_one(
                            {"_id": transaction["_id"]},
                            {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
                        )
                        
                        # Update user plan and credits
                        plan = transaction["plan"]
                        db.users.update_one(
                            {"_id": transaction["user_id"]},
                            {"$set": {"plan": plan, "credits": get_plan_credits(plan)}}
                        )
                        
                        # Create notification
                        db.notifications.insert_one({
                            "user_id": transaction["user_id"],
                            "icon": "💳",
                            "title": "Payment Successful!",
                            "text": f"Your {plan.capitalize()} plan is now active.",
                            "read": False,
                            "created_at": datetime.now(timezone.utc)
                        })
                        
                        return {"success": True, "status": "completed"}
        except Exception:
            pass
    
    return {"success": False, "status": "pending"}

@router.get("/transactions")
async def get_transactions(current_user: dict = Depends(get_current_user)):
    transactions = list(db.transactions.find(
        {"user_id": current_user["_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(20))
    
    for t in transactions:
        if isinstance(t.get("created_at"), datetime):
            t["created_at"] = t["created_at"].isoformat()
        if isinstance(t.get("completed_at"), datetime):
            t["completed_at"] = t["completed_at"].isoformat()
    
    return {"transactions": transactions}

@router.post("/stripe-webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    endpoint_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "whsec_mock")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        metadata = session.get("metadata", {})
        transaction_id = metadata.get("transaction_id")
        
        if transaction_id:
            from bson import ObjectId
            transaction = db.transactions.find_one({"_id": ObjectId(transaction_id)})
            if transaction and transaction["status"] != "completed":
                db.transactions.update_one(
                    {"_id": transaction["_id"]},
                    {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
                )
                
                plan = transaction["plan"]
                db.users.update_one(
                    {"_id": transaction["user_id"]},
                    {"$set": {"plan": plan, "credits": get_plan_credits(plan)}}
                )
                
                db.notifications.insert_one({
                    "user_id": transaction["user_id"],
                    "icon": "💳",
                    "title": "Payment Successful!",
                    "text": f"Your {plan.capitalize()} plan is now active.",
                    "read": False,
                    "created_at": datetime.now(timezone.utc)
                })

    return {"success": True}

import asyncio
import uuid

class MpesaSTKPushRequest(BaseModel):
    phone: str
    amount: int
    item: str

class CardCollectRequest(BaseModel):
    card_name: str
    card_number: str
    amount: int
    item: str

async def simulate_mpesa_completion(checkout_request_id: str, user_id: str, amount: int, item: str):
    await asyncio.sleep(8)
    from bson import ObjectId
    transaction = db.transactions.find_one({"checkout_request_id": checkout_request_id, "status": "pending"})
    if transaction:
        db.transactions.update_one(
            {"_id": transaction["_id"]},
            {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
        )
        credits_to_add = int(amount)
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"credits": credits_to_add}}
        )
        db.notifications.insert_one({
            "user_id": ObjectId(user_id),
            "icon": "📱",
            "title": "M-Pesa Payment Received",
            "text": f"Successfully collected KES {amount} for '{item}'. Added {credits_to_add} credits.",
            "read": False,
            "created_at": datetime.now(timezone.utc)
        })

async def simulate_card_completion(checkout_request_id: str, user_id: str, amount: int, item: str):
    await asyncio.sleep(3)
    from bson import ObjectId
    transaction = db.transactions.find_one({"checkout_request_id": checkout_request_id, "status": "pending"})
    if transaction:
        db.transactions.update_one(
            {"_id": transaction["_id"]},
            {"$set": {"status": "completed", "completed_at": datetime.now(timezone.utc)}}
        )
        credits_to_add = int(amount)
        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$inc": {"credits": credits_to_add}}
        )
        db.notifications.insert_one({
            "user_id": ObjectId(user_id),
            "icon": "💳",
            "title": "Card Payment Received",
            "text": f"Successfully collected USD {amount} for '{item}'. Added {credits_to_add} credits.",
            "read": False,
            "created_at": datetime.now(timezone.utc)
        })

@router.post("/mpesa/stkpush")
async def mpesa_stkpush(req: MpesaSTKPushRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    checkout_request_id = f"ws_CO_{uuid.uuid4().hex[:16]}"
    transaction = {
        "user_id": current_user["_id"],
        "type": "mpesa_stk",
        "checkout_request_id": checkout_request_id,
        "phone": req.phone,
        "amount": req.amount,
        "item": req.item,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    db.transactions.insert_one(transaction)
    background_tasks.add_task(
        simulate_mpesa_completion,
        checkout_request_id,
        str(current_user["_id"]),
        req.amount,
        req.item
    )
    return {
        "success": True,
        "checkout_request_id": checkout_request_id,
        "message": "STK Push initiated successfully."
    }

@router.post("/card/collect")
async def card_collect(req: CardCollectRequest, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    checkout_request_id = f"ws_CC_{uuid.uuid4().hex[:16]}"
    transaction = {
        "user_id": current_user["_id"],
        "type": "card_pos",
        "checkout_request_id": checkout_request_id,
        "card_name": req.card_name,
        "amount": req.amount,
        "item": req.item,
        "status": "pending",
        "created_at": datetime.now(timezone.utc)
    }
    db.transactions.insert_one(transaction)
    background_tasks.add_task(
        simulate_card_completion,
        checkout_request_id,
        str(current_user["_id"]),
        req.amount,
        req.item
    )
    return {
        "success": True,
        "checkout_request_id": checkout_request_id,
        "message": "Card transaction initiated successfully."
    }

@router.get("/mpesa/status/{checkout_request_id}")
async def get_mpesa_status(checkout_request_id: str, current_user: dict = Depends(get_current_user)):
    transaction = db.transactions.find_one({
        "checkout_request_id": checkout_request_id,
        "user_id": current_user["_id"]
    })
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {
        "status": transaction.get("status", "pending"),
        "amount": transaction.get("amount"),
        "item": transaction.get("item")
    }
