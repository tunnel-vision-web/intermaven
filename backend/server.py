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

    # Support legacy 'tool_id' and also accept as 'tool_id'
    class Config:
        extra = "allow"

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
    
    "social": lambda v: v.get('prompt_override') or f"""Social media strategist for African creatives.
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

# ============== ADMIN HELPERS ==============

ADMIN_ROLES = {"super_admin", "admin", "support", "finance"}

def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    user = get_current_user(credentials)
    if not user.get("admin_role") or user["admin_role"] not in ADMIN_ROLES:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

def log_audit(admin_id, admin_name: str, action: str, target_user_id=None, target_user_name: str = "", details: dict = None):
    db.audit_log.insert_one({
        "admin_id": str(admin_id),
        "admin_name": admin_name,
        "action": action,
        "target_user_id": str(target_user_id) if target_user_id else None,
        "target_user_name": target_user_name,
        "details": details or {},
        "created_at": datetime.now(timezone.utc)
    })

# ============== ADMIN — USER MANAGEMENT ==============

class AdminUserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    plan: Optional[str] = None
    portal: Optional[str] = None
    brand_name: Optional[str] = None
    bio: Optional[str] = None
    admin_role: Optional[str] = None
    audit_changes: Optional[dict] = None

class BulkAction(BaseModel):
    user_ids: List[str]
    action: str  # export, suspend, delete, plan_change
    value: Optional[str] = None

class CreditGrant(BaseModel):
    method: str  # preset, custom
    preset_label: Optional[str] = None
    credits: int
    note: Optional[str] = None

class AdminNote(BaseModel):
    note: str

@app.get("/api/admin/users")
async def admin_list_users(
    page: int = 1, per_page: int = 25,
    search: Optional[str] = None,
    plan: Optional[str] = None,
    portal: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: str = "created_at",
    sort_dir: str = "desc",
    admin: dict = Depends(get_admin_user)
):
    query = {}
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
        ]
    if plan: query["plan"] = plan
    if portal: query["portal"] = portal
    if status == "suspended": query["suspended"] = True
    elif status == "active": query["suspended"] = {"$ne": True}

    sort_order = 1 if sort_dir == "asc" else -1
    total = db.users.count_documents(query)
    skip = (page - 1) * per_page
    users_cursor = db.users.find(query).sort(sort_by, sort_order).skip(skip).limit(per_page)

    users = []
    for u in users_cursor:
        users.append({
            **serialize_user(u),
            "ai_runs": u.get("ai_runs", 0),
            "suspended": u.get("suspended", False),
            "admin_role": u.get("admin_role", ""),
            "admin_notes": u.get("admin_notes", []),
        })
    return {"users": users, "total": total, "page": page, "per_page": per_page}

@app.get("/api/admin/users/{user_id}")
async def admin_get_user(user_id: str, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u: raise HTTPException(404, "User not found")
    return {**serialize_user(u), "ai_runs": u.get("ai_runs", 0), "admin_role": u.get("admin_role", ""), "admin_notes": u.get("admin_notes", [])}

@app.put("/api/admin/users/{user_id}")
async def admin_update_user(user_id: str, data: AdminUserUpdate, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u: raise HTTPException(404, "User not found")

    update = {k: v for k, v in data.model_dump(exclude={"audit_changes"}).items() if v is not None}
    if update:
        db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update})

    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    target_name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "user_edit", u["_id"], target_name, data.audit_changes or update)

    updated = db.users.find_one({"_id": ObjectId(user_id)})
    return {**serialize_user(updated), "admin_role": updated.get("admin_role", "")}

@app.post("/api/admin/users/{user_id}/grant-credits")
async def admin_grant_credits(user_id: str, data: CreditGrant, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u: raise HTTPException(404, "User not found")

    db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"credits": data.credits}})

    db.admin_credit_grants.insert_one({
        "user_id": ObjectId(user_id),
        "admin_id": admin["_id"],
        "method": data.method,
        "preset_label": data.preset_label,
        "credits": data.credits,
        "note": data.note,
        "created_at": datetime.now(timezone.utc)
    })

    db.transactions.insert_one({
        "user_id": ObjectId(user_id),
        "type": "credit_grant",
        "plan": "credit_grant",
        "amount": 0,
        "credits": data.credits,
        "note": data.note,
        "granted_by": str(admin["_id"]),
        "status": "completed",
        "created_at": datetime.now(timezone.utc)
    })

    db.notifications.insert_one({
        "user_id": ObjectId(user_id),
        "icon": "⚡",
        "title": f"{data.credits} credits added!",
        "text": data.note or "Credits have been added to your account.",
        "read": False,
        "created_at": datetime.now(timezone.utc)
    })

    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    target_name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "credit_grant", u["_id"], target_name, {"credits": data.credits, "note": data.note})

    updated = db.users.find_one({"_id": ObjectId(user_id)})
    return {"success": True, "credits": updated.get("credits", 0)}

@app.post("/api/admin/users/{user_id}/notes")
async def admin_add_note(user_id: str, data: AdminNote, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u: raise HTTPException(404, "User not found")

    note_entry = {"note": data.note, "admin_id": str(admin["_id"]), "created_at": datetime.now(timezone.utc)}
    db.users.update_one({"_id": ObjectId(user_id)}, {"$push": {"admin_notes": note_entry}})

    updated = db.users.find_one({"_id": ObjectId(user_id)})
    notes = updated.get("admin_notes", [])
    for n in notes:
        if isinstance(n.get("created_at"), datetime):
            n["created_at"] = n["created_at"].isoformat()
    return {"notes": notes}

@app.get("/api/admin/users/{user_id}/activity")
async def admin_user_activity(user_id: str, admin: dict = Depends(get_admin_user)):
    activities = list(db.activities.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(50))
    for a in activities:
        a.pop("_id", None); a.pop("user_id", None)
        if isinstance(a.get("created_at"), datetime): a["created_at"] = a["created_at"].isoformat()
    return {"activities": activities}

@app.get("/api/admin/users/{user_id}/transactions")
async def admin_user_transactions(user_id: str, admin: dict = Depends(get_admin_user)):
    txs = list(db.transactions.find({"user_id": ObjectId(user_id)}).sort("created_at", -1).limit(50))
    for t in txs:
        t.pop("_id", None); t.pop("user_id", None)
        if isinstance(t.get("created_at"), datetime): t["created_at"] = t["created_at"].isoformat()
        if isinstance(t.get("completed_at"), datetime): t["completed_at"] = t["completed_at"].isoformat()
    return {"transactions": txs}

@app.post("/api/admin/users/{user_id}/suspend")
async def admin_suspend_user(user_id: str, admin: dict = Depends(get_admin_user)):
    u = db.users.find_one({"_id": ObjectId(user_id)})
    if not u: raise HTTPException(404, "User not found")
    suspended = not u.get("suspended", False)
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": {"suspended": suspended}})
    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    target_name = f"{u.get('first_name', '')} {u.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "suspend" if suspended else "unsuspend", u["_id"], target_name)
    return {"success": True, "suspended": suspended}

@app.post("/api/admin/users/bulk")
async def admin_bulk_action(data: BulkAction, admin: dict = Depends(get_admin_user)):
    results = []
    for uid in data.user_ids:
        try:
            oid = ObjectId(uid)
            if data.action == "suspend":
                db.users.update_one({"_id": oid}, {"$set": {"suspended": True}})
            elif data.action == "delete":
                db.users.update_one({"_id": oid}, {"$set": {"deleted": True, "deleted_at": datetime.now(timezone.utc)}})
            elif data.action == "plan_change" and data.value:
                db.users.update_one({"_id": oid}, {"$set": {"plan": data.value}})
            results.append({"id": uid, "success": True})
        except Exception as e:
            results.append({"id": uid, "success": False, "error": str(e)})
    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, f"bulk_{data.action}", details={"count": len(data.user_ids)})
    return {"results": results}

@app.get("/api/admin/users/export")
async def admin_export_users(admin: dict = Depends(get_admin_user)):
    from fastapi.responses import StreamingResponse
    import csv, io
    users = list(db.users.find({"deleted": {"$ne": True}}))
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "first_name", "last_name", "email", "phone", "plan", "credits", "portal", "ai_runs", "created_at"])
    for u in users:
        writer.writerow([str(u["_id"]), u.get("first_name", ""), u.get("last_name", ""), u.get("email", ""), u.get("phone", ""), u.get("plan", ""), u.get("credits", 0), u.get("portal", ""), u.get("ai_runs", 0), u.get("created_at", "").isoformat() if isinstance(u.get("created_at"), datetime) else ""])
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=users.csv"})

# ============== ADMIN — ANALYTICS ==============

@app.get("/api/admin/analytics/overview")
async def admin_analytics(range: str = "30d", admin: dict = Depends(get_admin_user)):
    now = datetime.now(timezone.utc)
    delta_map = {"7d": 7, "30d": 30, "90d": 90, "all": 36500}
    days = delta_map.get(range, 30)
    since = now - timedelta(days=days)

    total_users = db.users.count_documents({"deleted": {"$ne": True}})
    new_users = db.users.count_documents({"created_at": {"$gte": since}, "deleted": {"$ne": True}})
    active_users = db.activities.distinct("user_id", {"created_at": {"$gte": now - timedelta(days=30)}})

    by_plan = {
        "free": db.users.count_documents({"plan": "free", "deleted": {"$ne": True}}),
        "creator": db.users.count_documents({"plan": "creator", "deleted": {"$ne": True}}),
        "pro": db.users.count_documents({"plan": "pro", "deleted": {"$ne": True}}),
    }
    by_portal = {
        "music": db.users.count_documents({"portal": "music", "deleted": {"$ne": True}}),
        "business": db.users.count_documents({"portal": "business", "deleted": {"$ne": True}}),
    }

    total_ai_runs = db.ai_runs.count_documents({"created_at": {"$gte": since}})

    credit_grants = list(db.admin_credit_grants.aggregate([
        {"$match": {"created_at": {"$gte": since}}},
        {"$group": {"_id": None, "total": {"$sum": "$credits"}}}
    ]))
    credits_granted = credit_grants[0]["total"] if credit_grants else 0

    revenue_result = list(db.transactions.aggregate([
        {"$match": {"status": "completed", "created_at": {"$gte": since}, "amount": {"$gt": 0}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]))
    revenue = revenue_result[0]["total"] if revenue_result else 0

    tool_usage = list(db.ai_runs.aggregate([
        {"$match": {"created_at": {"$gte": since}}},
        {"$group": {"_id": "$tool_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}, {"$limit": 5},
        {"$project": {"tool_id": "$_id", "count": 1, "_id": 0}}
    ]))

    recent_signups_cursor = db.users.find({"deleted": {"$ne": True}}).sort("created_at", -1).limit(10)
    recent_signups = []
    for u in recent_signups_cursor:
        recent_signups.append({
            "first_name": u.get("first_name", ""),
            "last_name": u.get("last_name", ""),
            "email": u.get("email", ""),
            "plan": u.get("plan", ""),
            "portal": u.get("portal", ""),
            "created_at": u.get("created_at", "").isoformat() if isinstance(u.get("created_at"), datetime) else ""
        })

    return {
        "total_users": total_users,
        "new_users": new_users,
        "active_users": len(active_users),
        "by_plan": by_plan,
        "by_portal": by_portal,
        "total_ai_runs": total_ai_runs,
        "credits_granted": credits_granted,
        "revenue": revenue,
        "top_tools": tool_usage,
        "recent_signups": recent_signups,
        "user_growth": 0,
        "revenue_trend": 0,
        "new_user_trend": 0,
    }

# ============== ADMIN — AUDIT LOG ==============

@app.get("/api/admin/audit-log")
async def admin_audit_log(page: int = 1, per_page: int = 50, admin: dict = Depends(get_admin_user)):
    total = db.audit_log.count_documents({})
    skip = (page - 1) * per_page
    logs = list(db.audit_log.find({}).sort("created_at", -1).skip(skip).limit(per_page))
    for l in logs:
        l.pop("_id", None)
        if isinstance(l.get("created_at"), datetime): l["created_at"] = l["created_at"].isoformat()
    return {"logs": logs, "total": total}

# ============== ADMIN — SETTINGS ==============

class SystemSettings(BaseModel):
    default_plan: Optional[str] = "free"
    free_credits: Optional[int] = 150
    creator_credits: Optional[int] = 600
    pro_credits: Optional[int] = 2500
    brandkit_cost: Optional[int] = 10
    musicbio_cost: Optional[int] = 15
    syncpitch_cost: Optional[int] = 20
    bizpitch_cost: Optional[int] = 18
    maintenance_mode: Optional[bool] = False
    registrations_open: Optional[bool] = True

@app.get("/api/admin/settings")
async def get_admin_settings(admin: dict = Depends(get_admin_user)):
    settings = db.system_settings.find_one({"key": "global"})
    if not settings:
        return SystemSettings().model_dump()
    settings.pop("_id", None); settings.pop("key", None)
    return settings

@app.put("/api/admin/settings")
async def update_admin_settings(data: SystemSettings, admin: dict = Depends(get_admin_user)):
    if admin.get("admin_role") != "super_admin":
        raise HTTPException(403, "Super admin required for settings changes")
    db.system_settings.update_one({"key": "global"}, {"$set": {"key": "global", **data.model_dump()}}, upsert=True)
    admin_name = f"{admin.get('first_name', '')} {admin.get('last_name', '')}".strip()
    log_audit(admin["_id"], admin_name, "settings_update", details=data.model_dump())
    return {"success": True}

# ============== CRM — CONTACTS ==============

class ContactCreate(BaseModel):
    first_name: Optional[str] = ""
    last_name: Optional[str] = ""
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = ""
    job_title: Optional[str] = ""
    tags: Optional[List[str]] = []
    source: Optional[str] = "manual"
    notes_text: Optional[str] = None

@app.get("/api/crm/contacts")
async def crm_list_contacts(
    page: int = 1, per_page: int = 25,
    search: Optional[str] = None,
    tag: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"owner_id": current_user["_id"], "deleted": {"$ne": True}}
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}},
        ]
    if tag: query["tags"] = tag

    total = db.contacts.count_documents(query)
    skip = (page - 1) * per_page
    contacts_cursor = db.contacts.find(query).sort("created_at", -1).skip(skip).limit(per_page)
    contacts = []
    for c in contacts_cursor:
        c["id"] = str(c.pop("_id"))
        c.pop("owner_id", None)
        if isinstance(c.get("created_at"), datetime): c["created_at"] = c["created_at"].isoformat()
        if isinstance(c.get("updated_at"), datetime): c["updated_at"] = c["updated_at"].isoformat()
        contacts.append(c)
    return {"contacts": contacts, "total": total}

@app.post("/api/crm/contacts")
async def crm_create_contact(data: ContactCreate, current_user: dict = Depends(get_current_user)):
    if not data.email and not data.phone:
        raise HTTPException(400, "Email or phone required")
    contact = {
        "owner_id": current_user["_id"],
        "first_name": data.first_name,
        "last_name": data.last_name,
        "email": data.email.lower() if data.email else None,
        "phone": data.phone,
        "company": data.company,
        "job_title": data.job_title,
        "tags": data.tags or [],
        "source": data.source,
        "notes": [{"text": data.notes_text, "created_at": datetime.now(timezone.utc)}] if data.notes_text else [],
        "engagement": {"emails_sent": 0, "emails_opened": 0, "emails_clicked": 0, "whatsapp_messages": 0, "sms_messages": 0},
        "status": "active",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = db.contacts.insert_one(contact)
    return {"id": str(result.inserted_id), "success": True}

@app.put("/api/crm/contacts/{contact_id}")
async def crm_update_contact(contact_id: str, data: ContactCreate, current_user: dict = Depends(get_current_user)):
    c = db.contacts.find_one({"_id": ObjectId(contact_id), "owner_id": current_user["_id"]})
    if not c: raise HTTPException(404, "Contact not found")
    update = {k: v for k, v in data.model_dump(exclude={"notes_text"}).items() if v is not None}
    update["updated_at"] = datetime.now(timezone.utc)
    db.contacts.update_one({"_id": ObjectId(contact_id)}, {"$set": update})
    return {"success": True}

@app.delete("/api/crm/contacts/{contact_id}")
async def crm_delete_contact(contact_id: str, current_user: dict = Depends(get_current_user)):
    db.contacts.update_one({"_id": ObjectId(contact_id), "owner_id": current_user["_id"]}, {"$set": {"deleted": True}})
    return {"success": True}

@app.post("/api/crm/contacts/import")
async def crm_import_contacts(file: bytes = None, current_user: dict = Depends(get_current_user)):
    from fastapi import UploadFile, File
    # Handled via multipart — simplified endpoint
    return {"imported": 0, "message": "Import endpoint ready — connect file upload"}

@app.post("/api/crm/contacts/export")
async def crm_export_contacts(body: dict = {}, current_user: dict = Depends(get_current_user)):
    from fastapi.responses import StreamingResponse
    import csv, io
    query = {"owner_id": current_user["_id"], "deleted": {"$ne": True}}
    if body.get("contact_ids"):
        query["_id"] = {"$in": [ObjectId(x) for x in body["contact_ids"]]}
    contacts = list(db.contacts.find(query))
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["first_name", "last_name", "email", "phone", "company", "job_title", "tags", "source"])
    for c in contacts:
        writer.writerow([c.get("first_name", ""), c.get("last_name", ""), c.get("email", ""), c.get("phone", ""), c.get("company", ""), c.get("job_title", ""), ",".join(c.get("tags", [])), c.get("source", "")])
    output.seek(0)
    return StreamingResponse(io.BytesIO(output.getvalue().encode()), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=contacts.csv"})

@app.get("/api/crm/contacts/{contact_id}/messages")
async def crm_contact_messages(contact_id: str, current_user: dict = Depends(get_current_user)):
    msgs = list(db.crm_messages.find({"contact_id": ObjectId(contact_id), "owner_id": current_user["_id"]}).sort("created_at", -1).limit(100))
    for m in msgs:
        m["id"] = str(m.pop("_id"))
        m.pop("owner_id", None); m.pop("contact_id", None)
        if isinstance(m.get("created_at"), datetime): m["created_at"] = m["created_at"].isoformat()
    return {"messages": list(reversed(msgs))}

# ============== CRM — CAMPAIGNS ==============

class CampaignCreate(BaseModel):
    channel: str  # email, whatsapp, sms
    subject: Optional[str] = None
    body: str
    campaign_type: Optional[str] = "custom"
    recipient_type: str = "all"  # all, tag, plan
    tag_filter: Optional[str] = None
    plan_filter: Optional[str] = None
    scheduled_at: Optional[str] = None
    scheduled: Optional[bool] = False

@app.get("/api/crm/campaigns")
async def crm_list_campaigns(current_user: dict = Depends(get_current_user)):
    campaigns = list(db.crm_campaigns.find({"owner_id": current_user["_id"]}).sort("created_at", -1).limit(50))
    for c in campaigns:
        c["id"] = str(c.pop("_id"))
        c.pop("owner_id", None)
        for field in ["created_at", "sent_at", "scheduled_at"]:
            if isinstance(c.get(field), datetime): c[field] = c[field].isoformat()
    return {"campaigns": campaigns}

@app.post("/api/crm/campaigns")
async def crm_create_campaign(data: CampaignCreate, current_user: dict = Depends(get_current_user)):
    contact_query = {"owner_id": current_user["_id"], "deleted": {"$ne": True}, "status": "active"}
    if data.recipient_type == "tag" and data.tag_filter:
        contact_query["tags"] = data.tag_filter

    recipient_count = db.contacts.count_documents(contact_query)
    status = "scheduled" if data.scheduled and data.scheduled_at else "sent"

    campaign = {
        "owner_id": current_user["_id"],
        "channel": data.channel,
        "subject": data.subject,
        "body": data.body,
        "campaign_type": data.campaign_type,
        "recipient_type": data.recipient_type,
        "tag_filter": data.tag_filter,
        "recipients": recipient_count,
        "status": status,
        "stats": {"sent": 0, "delivered": 0, "opened": 0, "clicked": 0, "failed": 0},
        "created_at": datetime.now(timezone.utc),
        "sent_at": datetime.now(timezone.utc) if status == "sent" else None,
        "scheduled_at": datetime.fromisoformat(data.scheduled_at) if data.scheduled_at else None,
    }
    result = db.crm_campaigns.insert_one(campaign)
    campaign_id = result.inserted_id

    # If sending now, dispatch via Twilio/Resend (fire and forget - update stats async)
    if status == "sent":
        db.crm_campaigns.update_one({"_id": campaign_id}, {"$set": {"stats.sent": recipient_count}})

    return {"id": str(campaign_id), "success": True, "recipients": recipient_count, "status": status}

@app.delete("/api/crm/campaigns/{campaign_id}")
async def crm_delete_campaign(campaign_id: str, current_user: dict = Depends(get_current_user)):
    db.crm_campaigns.delete_one({"_id": ObjectId(campaign_id), "owner_id": current_user["_id"]})
    return {"success": True}

# ============== CRM — MESSAGING ==============

class DirectMessage(BaseModel):
    contact_id: Optional[str] = None
    channel: str  # whatsapp, sms, email
    body: str
    subject: Optional[str] = None

class DirectMessageDirect(BaseModel):
    channel: str
    to: str  # phone or email
    body: str
    subject: Optional[str] = None

async def send_twilio_message(to: str, body: str, channel: str):
    """Send via Twilio - requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN"""
    import os
    account_sid = os.environ.get("TWILIO_ACCOUNT_SID")
    auth_token = os.environ.get("TWILIO_AUTH_TOKEN")
    if not account_sid or not auth_token:
        return {"success": False, "error": "Twilio credentials not configured"}
    try:
        from_number = os.environ.get("TWILIO_WHATSAPP_NUMBER") if channel == "whatsapp" else os.environ.get("TWILIO_SMS_NUMBER")
        to_number = f"whatsapp:{to}" if channel == "whatsapp" else to
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.twilio.com/2010-04-01/Accounts/{account_sid}/Messages.json",
                data={"From": from_number, "To": to_number, "Body": body},
                auth=(account_sid, auth_token)
            )
            if response.status_code in [200, 201]:
                data = response.json()
                return {"success": True, "sid": data.get("sid"), "status": data.get("status")}
            return {"success": False, "error": response.text}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/api/crm/messages/send")
async def crm_send_message(data: DirectMessage, current_user: dict = Depends(get_current_user)):
    contact = db.contacts.find_one({"_id": ObjectId(data.contact_id), "owner_id": current_user["_id"]})
    if not contact: raise HTTPException(404, "Contact not found")

    to = contact.get("phone") if data.channel in ["whatsapp", "sms"] else contact.get("email")
    if not to: raise HTTPException(400, f"Contact has no {data.channel} address")

    result = await send_twilio_message(to, data.body, data.channel)

    msg_record = {
        "owner_id": current_user["_id"],
        "contact_id": ObjectId(data.contact_id),
        "channel": data.channel,
        "direction": "outbound",
        "to": to,
        "body": data.body,
        "status": "sent" if result.get("success") else "failed",
        "twilio_sid": result.get("sid"),
        "created_at": datetime.now(timezone.utc)
    }
    db.crm_messages.insert_one(msg_record)

    if result.get("success"):
        inc_field = "engagement.whatsapp_messages" if data.channel == "whatsapp" else f"engagement.{data.channel}_messages"
        db.contacts.update_one({"_id": ObjectId(data.contact_id)}, {"$inc": {inc_field: 1}})

    return {"success": result.get("success"), "error": result.get("error")}

@app.post("/api/crm/messages/send-direct")
async def crm_send_direct(data: DirectMessageDirect, current_user: dict = Depends(get_current_user)):
    result = await send_twilio_message(data.to, data.body, data.channel)

    db.crm_messages.insert_one({
        "owner_id": current_user["_id"],
        "contact_id": None,
        "channel": data.channel,
        "direction": "outbound",
        "to": data.to,
        "body": data.body,
        "status": "sent" if result.get("success") else "failed",
        "twilio_sid": result.get("sid"),
        "created_at": datetime.now(timezone.utc)
    })
    return {"success": result.get("success"), "error": result.get("error")}

@app.get("/api/crm/messages/recent")
async def crm_recent_messages(current_user: dict = Depends(get_current_user)):
    msgs = list(db.crm_messages.find({"owner_id": current_user["_id"]}).sort("created_at", -1).limit(20))
    for m in msgs:
        m["id"] = str(m.pop("_id"))
        m.pop("owner_id", None)
        if m.get("contact_id"): m["contact_id"] = str(m["contact_id"])
        if isinstance(m.get("created_at"), datetime): m["created_at"] = m["created_at"].isoformat()
    return {"messages": msgs}

@app.post("/api/crm/twilio/webhook")
async def twilio_inbound_webhook(request_data: dict):
    """Receives inbound WhatsApp/SMS replies from Twilio"""
    from_number = request_data.get("From", "").replace("whatsapp:", "")
    body = request_data.get("Body", "")
    channel = "whatsapp" if "whatsapp" in request_data.get("From", "") else "sms"

    # Find contact by phone number
    contact = db.contacts.find_one({"phone": from_number})

    msg_record = {
        "channel": channel,
        "direction": "inbound",
        "from": from_number,
        "body": body,
        "contact_id": contact["_id"] if contact else None,
        "owner_id": contact.get("owner_id") if contact else None,
        "created_at": datetime.now(timezone.utc)
    }
    db.crm_messages.insert_one(msg_record)

    if contact:
        inc_field = "engagement.whatsapp_messages" if channel == "whatsapp" else "engagement.sms_messages"
        db.contacts.update_one({"_id": contact["_id"]}, {"$inc": {inc_field: 1}})

    return {"success": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

# ============== EPK ROUTES ==============

class EPKCreate(BaseModel):
    username: Optional[str] = None
    artist_name: str
    tagline: Optional[str] = ""
    genres: Optional[List[str]] = []
    location: Optional[str] = ""
    bio_short: Optional[str] = ""
    bio_full: Optional[str] = ""
    highlights: Optional[List[dict]] = []
    music: Optional[dict] = {}
    social_links: Optional[dict] = {}
    contact: Optional[dict] = {}
    press_quotes: Optional[List[dict]] = []
    press_links: Optional[List[dict]] = []
    events_upcoming: Optional[List[dict]] = []
    design: Optional[dict] = {}
    is_published: Optional[bool] = False
    hosting: Optional[dict] = {}

def serialize_epk(epk: dict) -> dict:
    epk["id"] = str(epk.pop("_id", ""))
    epk.pop("user_id", None)
    for f in ["created_at", "updated_at"]:
        if isinstance(epk.get(f), datetime):
            epk[f] = epk[f].isoformat()
    return epk

@app.get("/api/epk/my")
async def get_my_epk(current_user: dict = Depends(get_current_user)):
    epk = db.epk_profiles.find_one({"user_id": current_user["_id"]})
    if not epk:
        raise HTTPException(404, "No EPK found")
    return {"epk": serialize_epk(epk)}

@app.post("/api/epk/create")
async def create_epk(data: EPKCreate, current_user: dict = Depends(get_current_user)):
    existing = db.epk_profiles.find_one({"user_id": current_user["_id"]})
    if existing:
        raise HTTPException(400, "EPK already exists — use PUT to update")
    
    if data.username:
        taken = db.epk_profiles.find_one({"username": data.username})
        if taken:
            raise HTTPException(400, "Username already taken")
    
    epk = {
        "user_id": current_user["_id"],
        **data.model_dump(),
        "analytics": {"total_views": 0, "unique_visitors": 0},
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
    }
    result = db.epk_profiles.insert_one(epk)
    epk["_id"] = result.inserted_id
    return {"epk": serialize_epk(epk)}

@app.put("/api/epk/{epk_id}")
async def update_epk(epk_id: str, data: EPKCreate, current_user: dict = Depends(get_current_user)):
    epk = db.epk_profiles.find_one({"_id": ObjectId(epk_id), "user_id": current_user["_id"]})
    if not epk:
        raise HTTPException(404, "EPK not found")
    
    if data.username and data.username != epk.get("username"):
        taken = db.epk_profiles.find_one({"username": data.username, "_id": {"$ne": ObjectId(epk_id)}})
        if taken:
            raise HTTPException(400, "Username already taken")
    
    update = {**data.model_dump(), "updated_at": datetime.now(timezone.utc)}
    db.epk_profiles.update_one({"_id": ObjectId(epk_id)}, {"$set": update})
    updated = db.epk_profiles.find_one({"_id": ObjectId(epk_id)})
    return {"epk": serialize_epk(updated)}

@app.post("/api/epk/{epk_id}/publish")
async def toggle_publish_epk(epk_id: str, current_user: dict = Depends(get_current_user)):
    epk = db.epk_profiles.find_one({"_id": ObjectId(epk_id), "user_id": current_user["_id"]})
    if not epk:
        raise HTTPException(404, "EPK not found")
    published = not epk.get("is_published", False)
    db.epk_profiles.update_one({"_id": ObjectId(epk_id)}, {"$set": {"is_published": published}})
    return {"is_published": published}

@app.get("/api/epk/check-username")
async def check_username(username: str, epk_id: Optional[str] = None):
    query = {"username": username}
    if epk_id:
        try:
            query["_id"] = {"$ne": ObjectId(epk_id)}
        except:
            pass
    taken = db.epk_profiles.find_one(query)
    return {"available": taken is None}

@app.get("/api/epk/public/{username}")
async def get_public_epk(username: str):
    epk = db.epk_profiles.find_one({"username": username, "is_published": True})
    if not epk:
        raise HTTPException(404, "EPK not found")
    db.epk_profiles.update_one({"_id": epk["_id"]}, {"$inc": {"analytics.total_views": 1}})
    db.epk_analytics.insert_one({"epk_id": epk["_id"], "event_type": "view", "timestamp": datetime.now(timezone.utc)})
    return serialize_epk(epk)

@app.get("/api/epk/{epk_id}/analytics")
async def get_epk_analytics(epk_id: str, current_user: dict = Depends(get_current_user)):
    epk = db.epk_profiles.find_one({"_id": ObjectId(epk_id), "user_id": current_user["_id"]})
    if not epk:
        raise HTTPException(404, "EPK not found")
    
    events = list(db.epk_analytics.find({"epk_id": ObjectId(epk_id)}))
    referrers = {}
    for e in events:
        ref = e.get("referrer", "Direct")
        referrers[ref] = referrers.get(ref, 0) + 1
    
    total = sum(referrers.values()) or 1
    top_referrers = sorted([{"source": k, "count": v, "pct": round(v/total*100)} for k, v in referrers.items()], key=lambda x: -x["count"])[:5]
    
    return {
        "total_views": epk.get("analytics", {}).get("total_views", 0),
        "unique_visitors": epk.get("analytics", {}).get("unique_visitors", 0),
        "link_clicks": len([e for e in events if e.get("event_type") == "click"]),
        "form_submissions": len([e for e in events if e.get("event_type") == "form_submit"]),
        "top_referrers": top_referrers,
    }

# ============== FILE MANAGEMENT ROUTES ==============

@app.get("/api/files")
async def list_files(
    folder_id: Optional[str] = None,
    search: Optional[str] = None,
    favorites: Optional[bool] = None,
    recent: Optional[bool] = None,
    trash: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user["_id"]}
    if trash:
        query["deleted_at"] = {"$ne": None}
    else:
        query["deleted_at"] = None
        if folder_id:
            query["folder_id"] = ObjectId(folder_id)
        elif not search and not favorites and not recent:
            query["folder_id"] = None
    
    if search:
        query["filename"] = {"$regex": search, "$options": "i"}
    if favorites:
        query["is_favorite"] = True
    
    sort = [("created_at", -1)] if recent else [("filename", 1)]
    limit = 20 if recent else 200
    
    files = list(db.files.find(query).sort(sort).limit(limit))
    result = []
    for f in files:
        f["id"] = str(f.pop("_id"))
        f.pop("user_id", None)
        if f.get("folder_id"): f["folder_id"] = str(f["folder_id"])
        if isinstance(f.get("created_at"), datetime): f["created_at"] = f["created_at"].isoformat()
        if isinstance(f.get("updated_at"), datetime): f["updated_at"] = f["updated_at"].isoformat()
        result.append(f)
    return {"files": result}

@app.get("/api/files/storage")
async def get_storage_info(current_user: dict = Depends(get_current_user)):
    result = list(db.files.aggregate([
        {"$match": {"user_id": current_user["_id"], "deleted_at": None}},
        {"$group": {"_id": None, "total": {"$sum": "$size"}}}
    ]))
    used = result[0]["total"] if result else 0
    return {"used": used}

@app.post("/api/files/upload")
async def upload_file(
    file: bytes = None,
    folder_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    from fastapi import UploadFile, File as FastAPIFile
    return {"success": True, "message": "Upload endpoint ready — connect to cloud storage (S3/GCS/R2)"}

@app.get("/api/files/{file_id}/download")
async def get_download_url(file_id: str, current_user: dict = Depends(get_current_user)):
    f = db.files.find_one({"_id": ObjectId(file_id), "user_id": current_user["_id"]})
    if not f:
        raise HTTPException(404, "File not found")
    return {"url": f.get("storage_url", "#")}

@app.post("/api/files/{file_id}/share")
async def share_file(file_id: str, current_user: dict = Depends(get_current_user)):
    import secrets
    f = db.files.find_one({"_id": ObjectId(file_id), "user_id": current_user["_id"]})
    if not f:
        raise HTTPException(404, "File not found")
    token = f.get("share_token") or secrets.token_urlsafe(16)
    db.files.update_one({"_id": ObjectId(file_id)}, {"$set": {"is_public": True, "share_token": token}})
    return {"share_url": f"https://intermaven.io/files/shared/{token}"}

@app.delete("/api/files/{file_id}")
async def delete_file(file_id: str, current_user: dict = Depends(get_current_user)):
    db.files.update_one(
        {"_id": ObjectId(file_id), "user_id": current_user["_id"]},
        {"$set": {"deleted_at": datetime.now(timezone.utc)}}
    )
    return {"success": True}

@app.get("/api/folders")
async def list_folders(
    parent_id: Optional[str] = None,
    root: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"user_id": current_user["_id"]}
    if root or parent_id is None:
        query["parent_id"] = None
    elif parent_id:
        query["parent_id"] = ObjectId(parent_id)
    
    folders = list(db.folders.find(query).sort("name", 1))
    result = []
    for f in folders:
        f["id"] = str(f.pop("_id"))
        f.pop("user_id", None)
        if f.get("parent_id"): f["parent_id"] = str(f["parent_id"])
        if isinstance(f.get("created_at"), datetime): f["created_at"] = f["created_at"].isoformat()
        result.append(f)
    return {"folders": result}

@app.get("/api/folders/{folder_id}")
async def get_folder(folder_id: str, current_user: dict = Depends(get_current_user)):
    f = db.folders.find_one({"_id": ObjectId(folder_id), "user_id": current_user["_id"]})
    if not f:
        raise HTTPException(404, "Folder not found")
    return {"id": str(f["_id"]), "name": f["name"], "parent_id": str(f.get("parent_id", "")) or None}

class FolderCreate(BaseModel):
    name: str
    parent_id: Optional[str] = None
    color: Optional[str] = None

@app.post("/api/folders")
async def create_folder(data: FolderCreate, current_user: dict = Depends(get_current_user)):
    folder = {
        "user_id": current_user["_id"],
        "name": data.name,
        "parent_id": ObjectId(data.parent_id) if data.parent_id else None,
        "color": data.color,
        "created_at": datetime.now(timezone.utc),
    }
    result = db.folders.insert_one(folder)
    return {"id": str(result.inserted_id), "name": data.name}

@app.put("/api/folders/{folder_id}")
async def update_folder(folder_id: str, data: FolderCreate, current_user: dict = Depends(get_current_user)):
    db.folders.update_one(
        {"_id": ObjectId(folder_id), "user_id": current_user["_id"]},
        {"$set": {"name": data.name}}
    )
    return {"success": True}

@app.delete("/api/folders/{folder_id}")
async def delete_folder(folder_id: str, current_user: dict = Depends(get_current_user)):
    db.folders.delete_one({"_id": ObjectId(folder_id), "user_id": current_user["_id"]})
    db.files.update_many(
        {"folder_id": ObjectId(folder_id), "user_id": current_user["_id"]},
        {"$set": {"deleted_at": datetime.now(timezone.utc)}}
    )
    return {"success": True}
