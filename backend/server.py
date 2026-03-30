from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
import httpx

load_dotenv()

app = FastAPI(title="Intermaven API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "intermaven")
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", "intermaven_secret_key")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Credit allocations by plan
PLAN_CREDITS = {"free": 150, "creator": 600, "pro": 2500}

# ============== MODELS ==============

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str
    last_name: Optional[str] = ""
    phone: Optional[str] = ""
    portal: Optional[str] = "music"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    brand_name: Optional[str] = None
    bio: Optional[str] = None
    portal: Optional[str] = None

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    phone: str
    plan: str
    credits: int
    apps: List[str]
    portal: str
    brand_name: str
    bio: str
    created_at: str
    
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class AppToggle(BaseModel):
    app_id: str

class AIGenerateRequest(BaseModel):
    tool_id: str
    inputs: dict

class PlanUpgrade(BaseModel):
    plan: str
    payment_method: str

# ============== HELPER FUNCTIONS ==============

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "email": user.get("email", ""),
        "first_name": user.get("first_name", ""),
        "last_name": user.get("last_name", ""),
        "phone": user.get("phone", ""),
        "plan": user.get("plan", "free"),
        "credits": user.get("credits", 150),
        "apps": user.get("apps", []),
        "portal": user.get("portal", "music"),
        "brand_name": user.get("brand_name", ""),
        "bio": user.get("bio", ""),
        "created_at": user.get("created_at", datetime.now(timezone.utc)).isoformat() if isinstance(user.get("created_at"), datetime) else str(user.get("created_at", ""))
    }

# ============== AUTH ROUTES ==============

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate):
    existing_user = db.users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    new_user = {
        "email": user_data.email.lower(),
        "password": hashed_password,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "plan": "free",
        "credits": PLAN_CREDITS["free"],
        "apps": ["brandkit", "musicbio", "social", "syncpitch", "bizpitch"],
        "portal": user_data.portal,
        "brand_name": "",
        "bio": "",
        "channels": {"email": True, "whatsapp": True, "sms": False, "push": False},
        "ai_runs": 0,
        "created_at": datetime.now(timezone.utc)
    }
    
    result = db.users.insert_one(new_user)
    new_user["_id"] = result.inserted_id
    
    access_token = create_access_token(data={"sub": str(result.inserted_id)})
    
    # Create welcome notification
    db.notifications.insert_one({
        "user_id": result.inserted_id,
        "icon": "🎉",
        "title": "Welcome to Intermaven!",
        "text": "Your account is set up. Start exploring your tools.",
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**serialize_user(new_user))
    )

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    user = db.users.find_one({"email": user_data.email.lower()})
    if not user or not verify_password(user_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    access_token = create_access_token(data={"sub": str(user["_id"])})
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse(**serialize_user(user))
    )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(**serialize_user(current_user))

# ============== USER ROUTES ==============

@app.put("/api/user/profile", response_model=UserResponse)
async def update_profile(update_data: UserUpdate, current_user: dict = Depends(get_current_user)):
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    if update_dict:
        db.users.update_one({"_id": current_user["_id"]}, {"$set": update_dict})
    
    updated_user = db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**serialize_user(updated_user))

@app.post("/api/user/apps/toggle", response_model=UserResponse)
async def toggle_app(app_data: AppToggle, current_user: dict = Depends(get_current_user)):
    apps = current_user.get("apps", [])
    if app_data.app_id in apps:
        apps.remove(app_data.app_id)
    else:
        apps.append(app_data.app_id)
    
    db.users.update_one({"_id": current_user["_id"]}, {"$set": {"apps": apps}})
    updated_user = db.users.find_one({"_id": current_user["_id"]})
    return UserResponse(**serialize_user(updated_user))

@app.get("/api/user/stats")
async def get_user_stats(current_user: dict = Depends(get_current_user)):
    # Get AI runs this week
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    ai_runs = db.ai_runs.count_documents({
        "user_id": current_user["_id"],
        "created_at": {"$gte": week_ago}
    })
    
    return {
        "credits": current_user.get("credits", 0),
        "plan": current_user.get("plan", "free"),
        "ai_runs_week": ai_runs,
        "active_apps": len(current_user.get("apps", [])),
        "scheduled_posts": 0
    }

# ============== NOTIFICATIONS ==============

@app.get("/api/notifications")
async def get_notifications(current_user: dict = Depends(get_current_user)):
    notifications = list(db.notifications.find(
        {"user_id": current_user["_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(20))
    
    for n in notifications:
        if isinstance(n.get("created_at"), datetime):
            n["created_at"] = n["created_at"].isoformat()
    
    unread_count = db.notifications.count_documents({
        "user_id": current_user["_id"],
        "read": False
    })
    
    return {"notifications": notifications, "unread_count": unread_count}

@app.post("/api/notifications/mark-read")
async def mark_notifications_read(current_user: dict = Depends(get_current_user)):
    db.notifications.update_many(
        {"user_id": current_user["_id"]},
        {"$set": {"read": True}}
    )
    return {"success": True}

# ============== AI GENERATION ==============

TOOL_COSTS = {
    "brandkit": 10,
    "musicbio": 15,
    "social": 0,
    "syncpitch": 20,
    "bizpitch": 18
}

TOOL_PROMPTS = {
    "brandkit": lambda v: f"""Senior brand strategist for African creative businesses.
Name: {v.get('name', '')} Industry: {v.get('industry', '')} Audience: {v.get('audience', '')} Vibe: {v.get('vibe', '')} Extra: {v.get('extra', '')}

Create a complete brand kit with:
1. BRAND NAME ANALYSIS
2. TAGLINE OPTIONS (3+ with rationale)
3. TONE OF VOICE (3-4 principles)
4. COLOUR DIRECTION
5. POSITIONING STATEMENT
6. BRAND PERSONALITY (5 adjectives + anti-adjective)
Be specific to African/Nairobi market.""",
    
    "musicbio": lambda v: f"""Music PR professional placing African artists internationally.
Artist: {v.get('artist', '')} Genre: {v.get('genre', '')} Origin: {v.get('origin', '')} Story: {v.get('story', '')} Tone: {v.get('tone', '')} Extra: {v.get('extra', '')}

Create:
1. SHORT BIO (100 words)
2. FULL BIO (250 words)
3. PRESS NARRATIVE (3 paragraphs)
4. MEDIA PITCH (150 words)
5. 3 INTERVIEW ANGLES""",
    
    "social": lambda v: f"""Social media strategist for African creatives.
Topic: {v.get('topic', '')} Platform: {v.get('platform', '')} Goal: {v.get('goal', '')} Tone: {v.get('tone', '')} Extra: {v.get('extra', '')}

Create:
1. 3 caption variations for {v.get('platform', 'the platform')}
2. 8 relevant hashtags
3. Best posting time for Nairobi audiences
4. One engagement tip""",
    
    "syncpitch": lambda v: f"""Sync licensing agent placing African music globally.
Artist: {v.get('artist', '')} Track: {v.get('track', '')} Target: {v.get('target', '')} Mood: {v.get('mood', '')} Extra: {v.get('extra', '')}

Create:
1. SUBJECT LINE (3 options)
2. PITCH EMAIL (200-250 words for {v.get('target', 'the target')})
3. TRACK DESCRIPTION (60 words)
4. USAGE SUGGESTIONS (3 scenarios)
5. RIGHTS SUMMARY""",
    
    "bizpitch": lambda v: f"""Startup pitch consultant, East African investment landscape.
Business: {v.get('business', '')} Sector: {v.get('sector', '')} Problem: {v.get('problem', '')} Audience: {v.get('audience', '')} Extra: {v.get('extra', '')}

Create:
1. PROBLEM STATEMENT
2. SOLUTION SLIDE COPY
3. MARKET OPPORTUNITY
4. TRACTION SECTION
5. CALL TO ACTION"""
}

@app.post("/api/ai/generate")
async def generate_ai_content(request: AIGenerateRequest, current_user: dict = Depends(get_current_user)):
    tool_id = request.tool_id
    inputs = request.inputs
    
    if tool_id not in TOOL_COSTS:
        raise HTTPException(status_code=400, detail="Invalid tool ID")
    
    cost = TOOL_COSTS[tool_id]
    if cost > 0 and current_user.get("credits", 0) < cost:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    
    prompt = TOOL_PROMPTS[tool_id](inputs)
    
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
        
        chat = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            session_id=f"intermaven-{str(current_user['_id'])}-{tool_id}",
            system_message="You are a helpful AI assistant specialized in African creative and business markets."
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Deduct credits
        if cost > 0:
            db.users.update_one(
                {"_id": current_user["_id"]},
                {"$inc": {"credits": -cost, "ai_runs": 1}}
            )
        
        # Log AI run
        db.ai_runs.insert_one({
            "user_id": current_user["_id"],
            "tool_id": tool_id,
            "cost": cost,
            "created_at": datetime.now(timezone.utc)
        })
        
        # Log activity
        db.activities.insert_one({
            "user_id": current_user["_id"],
            "type": "ai_generation",
            "tool_id": tool_id,
            "created_at": datetime.now(timezone.utc)
        })
        
        updated_user = db.users.find_one({"_id": current_user["_id"]})
        
        return {
            "success": True,
            "content": response,
            "credits_used": cost,
            "credits_remaining": updated_user.get("credits", 0)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

# ============== ACTIVITY ==============

@app.get("/api/activities")
async def get_activities(current_user: dict = Depends(get_current_user)):
    activities = list(db.activities.find(
        {"user_id": current_user["_id"]},
        {"_id": 0, "user_id": 0}
    ).sort("created_at", -1).limit(10))
    
    for a in activities:
        if isinstance(a.get("created_at"), datetime):
            a["created_at"] = a["created_at"].isoformat()
    
    return {"activities": activities}

# ============== PESAPAL PAYMENTS ==============

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

@app.post("/api/payments/initiate")
async def initiate_payment(payment: PaymentInitiate, current_user: dict = Depends(get_current_user)):
    if payment.plan not in PLAN_CREDITS:
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
    
    # If Pesapal is not configured, return mock response
    if not PESAPAL_CONSUMER_KEY:
        return {
            "success": True,
            "transaction_id": transaction_id,
            "message": "Payment integration pending configuration. Contact support.",
            "mock": True
        }
    
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
            
            raise HTTPException(status_code=500, detail="Payment initiation failed")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/payments/callback")
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
                            {"$set": {"plan": plan, "credits": PLAN_CREDITS[plan]}}
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

@app.get("/api/payments/transactions")
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

# ============== HEALTH CHECK ==============

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Intermaven API"}

# ============== NEWSLETTER ==============

class NewsletterSubscribe(BaseModel):
    email: EmailStr

@app.post("/api/newsletter/subscribe")
async def subscribe_newsletter(data: NewsletterSubscribe):
    # Check if already subscribed
    existing = db.newsletter_subscribers.find_one({"email": data.email.lower()})
    if existing:
        return {"success": True, "message": "Already subscribed"}
    
    # Add subscriber
    db.newsletter_subscribers.insert_one({
        "email": data.email.lower(),
        "subscribed_at": datetime.now(timezone.utc),
        "status": "active"
    })
    
    return {"success": True, "message": "Successfully subscribed"}

# ============== BETA SIGNUPS ==============

class BetaSignup(BaseModel):
    app_id: str  # 'epk', 'lead_gen', 'pos'
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    preferred_channel: str  # 'email', 'whatsapp', 'sms'
    portal: Optional[str] = "music"

@app.post("/api/beta/signup")
async def signup_beta(data: BetaSignup):
    if data.preferred_channel == 'email' and not data.email:
        raise HTTPException(status_code=400, detail="Email required for email notifications")
    if data.preferred_channel in ['whatsapp', 'sms'] and not data.phone:
        raise HTTPException(status_code=400, detail="Phone required for WhatsApp/SMS notifications")
    
    # Check if already signed up
    query = {"app_id": data.app_id}
    if data.email:
        query["email"] = data.email.lower()
    elif data.phone:
        query["phone"] = data.phone
    
    existing = db.beta_signups.find_one(query)
    if existing:
        return {"success": True, "message": "Already on waitlist"}
    
    # Add to waitlist
    signup_data = {
        "app_id": data.app_id,
        "email": data.email.lower() if data.email else None,
        "phone": data.phone,
        "preferred_channel": data.preferred_channel,
        "portal": data.portal,
        "status": "waiting",
        "created_at": datetime.now(timezone.utc)
    }
    
    db.beta_signups.insert_one(signup_data)
    
    return {"success": True, "message": "Successfully joined waitlist"}

@app.get("/api/beta/status/{app_id}")
async def get_beta_status(app_id: str, email: Optional[str] = None, phone: Optional[str] = None):
    query = {"app_id": app_id}
    if email:
        query["email"] = email.lower()
    elif phone:
        query["phone"] = phone
    else:
        raise HTTPException(status_code=400, detail="Email or phone required")
    
    signup = db.beta_signups.find_one(query)
    if not signup:
        return {"signed_up": False}
    
    return {
        "signed_up": True,
        "status": signup.get("status", "waiting"),
        "created_at": signup.get("created_at").isoformat() if isinstance(signup.get("created_at"), datetime) else None
    }

# ============== SUPPORT TICKETS ==============

class SupportTicketCreate(BaseModel):
    subject: str
    message: str
    category: str = "general"  # general, billing, technical, ai-tools
    preferred_channel: str = "email"  # email, whatsapp, sms
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    user_id: Optional[str] = None

class TicketMessage(BaseModel):
    ticket_id: str
    message: str
    sender: str = "user"  # user, ai, admin

@app.post("/api/support/tickets")
async def create_support_ticket(data: SupportTicketCreate):
    if data.preferred_channel == 'email' and not data.email:
        raise HTTPException(status_code=400, detail="Email required for email communication")
    if data.preferred_channel in ['whatsapp', 'sms'] and not data.phone:
        raise HTTPException(status_code=400, detail="Phone required for WhatsApp/SMS communication")
    
    # Generate ticket ID
    ticket_count = db.support_tickets.count_documents({}) + 1
    ticket_id = f"TKT-{ticket_count:06d}"
    
    ticket_data = {
        "ticket_id": ticket_id,
        "subject": data.subject,
        "category": data.category,
        "status": "open",  # open, in_progress, resolved, closed
        "priority": "normal",  # low, normal, high, urgent
        "preferred_channel": data.preferred_channel,
        "email": data.email.lower() if data.email else None,
        "phone": data.phone,
        "user_id": data.user_id,
        "messages": [
            {
                "sender": "user",
                "message": data.message,
                "timestamp": datetime.now(timezone.utc)
            }
        ],
        "ai_handled": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    db.support_tickets.insert_one(ticket_data)
    
    # Auto-generate AI response based on category
    ai_response = generate_ai_ticket_response(data.subject, data.message, data.category)
    
    # Add AI response to ticket
    db.support_tickets.update_one(
        {"ticket_id": ticket_id},
        {
            "$push": {
                "messages": {
                    "sender": "ai",
                    "message": ai_response,
                    "timestamp": datetime.now(timezone.utc)
                }
            },
            "$set": {"status": "in_progress", "updated_at": datetime.now(timezone.utc)}
        }
    )
    
    return {
        "success": True,
        "ticket_id": ticket_id,
        "message": "Support ticket created. Our AI assistant is reviewing your request.",
        "ai_response": ai_response
    }

def generate_ai_ticket_response(subject: str, message: str, category: str) -> str:
    """Generate automated AI response based on ticket content"""
    message_lower = message.lower()
    
    # Billing related
    if category == "billing" or any(word in message_lower for word in ['credit', 'payment', 'mpesa', 'refund', 'charge']):
        return """Thank you for reaching out about billing. I'm reviewing your account now.

**Common solutions:**
- Credits are added instantly after M-Pesa confirmation
- Check your transaction history in Dashboard → Settings → Billing
- If payment failed, try again or use a different payment method

I'll investigate your specific case and respond within 24 hours via your preferred channel. If this is urgent, please reply with "URGENT" and I'll escalate immediately.

— Ayo, AI Support"""
    
    # Technical issues
    if category == "technical" or any(word in message_lower for word in ['error', 'bug', 'broken', 'not working', "doesn't work", 'issue']):
        return """I see you're experiencing a technical issue. Let me help troubleshoot.

**Quick fixes to try:**
1. Clear your browser cache and cookies
2. Try a different browser (Chrome recommended)
3. Log out and log back in
4. Check if the issue persists on mobile

Please share:
- Which browser/device you're using
- Any error messages you see
- Steps to reproduce the issue

I'm analyzing the system logs now and will follow up shortly.

— Ayo, AI Support"""
    
    # AI tools related
    if category == "ai-tools" or any(word in message_lower for word in ['brand kit', 'music bio', 'social ai', 'sync pitch', 'generate']):
        return """Thanks for your question about our AI tools!

**Quick tips:**
- Each tool has specific input requirements for best results
- More detailed inputs = better outputs
- You can regenerate if the first result isn't perfect

**Credit costs:**
- Brand Kit: 10 credits
- Music Bio: 15 credits
- Social AI: Free
- Sync Pitch: 20 credits
- Pitch Deck: 18 credits

Let me know which specific tool you need help with, and I'll provide detailed guidance.

— Ayo, AI Support"""
    
    # Default response
    return """Thank you for contacting Intermaven support. I've received your message and am reviewing it now.

I'll analyze your request and provide a detailed response within 24 hours via your preferred communication channel.

If this is urgent, please reply with "URGENT" to escalate.

In the meantime, you might find answers in:
- Our Help Center: /help
- Community Forum: /forum

— Ayo, AI Support"""

@app.get("/api/support/tickets/{ticket_id}")
async def get_ticket(ticket_id: str):
    ticket = db.support_tickets.find_one({"ticket_id": ticket_id}, {"_id": 0})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Convert datetime objects to ISO strings
    if isinstance(ticket.get("created_at"), datetime):
        ticket["created_at"] = ticket["created_at"].isoformat()
    if isinstance(ticket.get("updated_at"), datetime):
        ticket["updated_at"] = ticket["updated_at"].isoformat()
    for msg in ticket.get("messages", []):
        if isinstance(msg.get("timestamp"), datetime):
            msg["timestamp"] = msg["timestamp"].isoformat()
    
    return ticket

@app.post("/api/support/tickets/{ticket_id}/reply")
async def reply_to_ticket(ticket_id: str, data: TicketMessage):
    ticket = db.support_tickets.find_one({"ticket_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Add message
    db.support_tickets.update_one(
        {"ticket_id": ticket_id},
        {
            "$push": {
                "messages": {
                    "sender": data.sender,
                    "message": data.message,
                    "timestamp": datetime.now(timezone.utc)
                }
            },
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    return {"success": True, "message": "Reply added"}

@app.post("/api/support/tickets/{ticket_id}/resolve")
async def resolve_ticket(ticket_id: str):
    ticket = db.support_tickets.find_one({"ticket_id": ticket_id})
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    # Mark as resolved
    db.support_tickets.update_one(
        {"ticket_id": ticket_id},
        {
            "$set": {
                "status": "resolved",
                "resolved_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Create forum post from resolved ticket
    forum_post = {
        "title": f"Resolved: {ticket['subject']}",
        "category": ticket["category"],
        "content": ticket["messages"],
        "source": "support_ticket",
        "ticket_id": ticket_id,
        "author": "Intermaven Support",
        "author_role": "Admin",
        "status": "published",
        "created_at": datetime.now(timezone.utc)
    }
    db.forum_posts.insert_one(forum_post)
    
    return {"success": True, "message": "Ticket resolved and posted to forum"}

@app.get("/api/support/tickets")
async def list_user_tickets(email: Optional[str] = None, phone: Optional[str] = None):
    query = {}
    if email:
        query["email"] = email.lower()
    elif phone:
        query["phone"] = phone
    else:
        raise HTTPException(status_code=400, detail="Email or phone required")
    
    tickets = list(db.support_tickets.find(query, {"_id": 0}).sort("created_at", -1).limit(50))
    
    # Convert datetime objects
    for ticket in tickets:
        if isinstance(ticket.get("created_at"), datetime):
            ticket["created_at"] = ticket["created_at"].isoformat()
        if isinstance(ticket.get("updated_at"), datetime):
            ticket["updated_at"] = ticket["updated_at"].isoformat()
    
    return {"tickets": tickets}

# ============== CRM WAITLIST ==============

class WaitlistSignup(BaseModel):
    list_type: str  # 'general', 'epk', 'pos', 'lead_gen', 'partner', 'enterprise'
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    company: Optional[str] = None
    preferred_channel: str = "email"  # email, whatsapp, sms
    source: Optional[str] = None  # where they signed up from
    notes: Optional[str] = None

@app.post("/api/crm/waitlist")
async def add_to_waitlist(data: WaitlistSignup):
    if data.preferred_channel == 'email' and not data.email:
        raise HTTPException(status_code=400, detail="Email required for email notifications")
    if data.preferred_channel in ['whatsapp', 'sms'] and not data.phone:
        raise HTTPException(status_code=400, detail="Phone required for WhatsApp/SMS notifications")
    
    # Check for duplicates
    query = {"list_type": data.list_type}
    if data.email:
        query["email"] = data.email.lower()
    elif data.phone:
        query["phone"] = data.phone
    
    existing = db.crm_waitlist.find_one(query)
    if existing:
        return {"success": True, "message": "Already on this waitlist", "already_exists": True}
    
    waitlist_entry = {
        "list_type": data.list_type,
        "email": data.email.lower() if data.email else None,
        "phone": data.phone,
        "name": data.name,
        "company": data.company,
        "preferred_channel": data.preferred_channel,
        "source": data.source,
        "notes": data.notes,
        "status": "active",
        "created_at": datetime.now(timezone.utc),
        "contacted": False,
        "converted": False
    }
    
    db.crm_waitlist.insert_one(waitlist_entry)
    
    return {"success": True, "message": f"Added to {data.list_type} waitlist"}

@app.get("/api/crm/waitlist/{list_type}")
async def get_waitlist(list_type: str):
    entries = list(db.crm_waitlist.find(
        {"list_type": list_type, "status": "active"}, 
        {"_id": 0}
    ).sort("created_at", -1))
    
    for entry in entries:
        if isinstance(entry.get("created_at"), datetime):
            entry["created_at"] = entry["created_at"].isoformat()
    
    return {"waitlist": entries, "count": len(entries)}

# ============== USER APPS ==============

class AddAppRequest(BaseModel):
    app_id: str

@app.post("/api/users/apps")
async def add_user_app(data: AddAppRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    # List of available apps
    available_apps = ['brandkit', 'musicbio', 'social', 'syncpitch', 'bizpitch']
    
    if data.app_id not in available_apps:
        raise HTTPException(status_code=400, detail="Invalid app ID")
    
    # Check if user already has the app
    current_apps = user.get("apps", [])
    if data.app_id in current_apps:
        return {"success": True, "message": "App already added", "apps": current_apps}
    
    # Add the app
    new_apps = current_apps + [data.app_id]
    db.users.update_one(
        {"email": user["email"]},
        {"$set": {"apps": new_apps}}
    )
    
    return {"success": True, "message": f"Added {data.app_id}", "apps": new_apps}

@app.delete("/api/users/apps/{app_id}")
async def remove_user_app(app_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    current_apps = user.get("apps", [])
    if app_id not in current_apps:
        return {"success": True, "message": "App not in user's list", "apps": current_apps}
    
    # Remove the app
    new_apps = [a for a in current_apps if a != app_id]
    db.users.update_one(
        {"email": user["email"]},
        {"$set": {"apps": new_apps}}
    )
    
    return {"success": True, "message": f"Removed {app_id}", "apps": new_apps}

@app.get("/api/users/apps")
async def get_user_apps(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user = get_current_user(credentials.credentials)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"apps": user.get("apps", [])}

@app.get("/api/apps/available")
async def get_available_apps():
    """Get list of all available apps with their details"""
    apps = {
        "brandkit": {"id": "brandkit", "name": "Brand Kit AI", "icon": "brandkit", "color": "#7c6ff7", "desc": "Brand names, taglines, tone of voice", "cost": 10, "status": "live"},
        "musicbio": {"id": "musicbio", "name": "Music Bio & Press Kit", "icon": "musicbio", "color": "#22d3ee", "desc": "Artist bios and press materials", "cost": 15, "status": "live"},
        "social": {"id": "social", "name": "Social AI", "icon": "social", "color": "#f43f5e", "desc": "Multi-platform social management", "cost": 0, "status": "live"},
        "syncpitch": {"id": "syncpitch", "name": "Sync Pitch AI", "icon": "syncpitch", "color": "#f59e0b", "desc": "Film, TV and advertising pitches", "cost": 20, "status": "live"},
        "bizpitch": {"id": "bizpitch", "name": "Pitch Deck AI", "icon": "pitchdeck", "color": "#8b5cf6", "desc": "Investor and grant pitch decks", "cost": 18, "status": "live"},
        "epk": {"id": "epk", "name": "Electronic Press Kit", "icon": "epk", "color": "#ec4899", "desc": "Hosted EPK pages for artists", "cost": 25, "status": "coming_soon"},
        "pos": {"id": "pos", "name": "Intermaven POS", "icon": "pos", "color": "#0e9499", "desc": "M-Pesa native point of sale", "cost": 0, "status": "coming_soon"},
        "distro": {"id": "distro", "name": "Distribution Tracker", "icon": "distro", "color": "#0ea5e9", "desc": "Track music across platforms", "cost": 10, "status": "coming_soon"}
    }
    return {"apps": apps}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
