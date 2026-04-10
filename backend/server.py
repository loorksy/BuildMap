from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from bson import ObjectId
import httpx
from cryptography.fernet import Fernet
import base64
import hashlib
import secrets
import json
import re
import io
import zipfile
from fastapi.responses import StreamingResponse
from ai_system import full_analysis as ai_full_analysis, AdvancedNLP, SKILLS_LIBRARY, AGENTS, AgentRole

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"

# Encryption key for API keys
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY", Fernet.generate_key().decode())

# Create the main app
app = FastAPI(title="BuildMap API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class APIKeyCreate(BaseModel):
    api_key: str
    provider: str = "openrouter"
    default_model: str = "openai/gpt-4o"

class ProjectCreate(BaseModel):
    title: str
    idea: str

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    selected_model: Optional[str] = None

class MessageCreate(BaseModel):
    content: str

# ==================== CONVERSATION ANALYSIS ====================

CONVERSATION_STAGES = [
    {"id": "idea", "name": "فهم الفكرة", "questions": ["نوع المشروع", "الوصف الأساسي"]},
    {"id": "audience", "name": "الفئة المستهدفة", "questions": ["من المستخدمون", "احتياجاتهم"]},
    {"id": "problem", "name": "المشكلة والحل", "questions": ["المشكلة المراد حلها", "كيف يحلها"]},
    {"id": "features", "name": "الميزات", "questions": ["الميزات الرئيسية", "الميزات الإضافية"]},
    {"id": "technical", "name": "المتطلبات التقنية", "questions": ["التقنيات", "قاعدة البيانات", "APIs"]},
    {"id": "ready", "name": "جاهز للتوليد", "questions": []}
]

def analyze_conversation_progress(messages: List[dict], idea: str) -> dict:
    """Analyze conversation to determine progress and extract project info"""
    
    conversation_text = " ".join([m["content"] for m in messages]).lower()
    
    # Keywords for each stage
    stage_keywords = {
        "idea": ["تطبيق", "موقع", "نظام", "منصة", "برنامج", "api", "ويب", "موبايل", "web", "mobile", "app"],
        "audience": ["مستخدم", "عميل", "شركة", "مطور", "طالب", "موظف", "تاجر", "بائع", "مشتري"],
        "problem": ["مشكلة", "حل", "تحدي", "صعوبة", "يحتاج", "يريد", "هدف", "غرض"],
        "features": ["ميزة", "خاصية", "وظيفة", "يمكن", "يستطيع", "إضافة", "تسجيل", "بحث", "عرض", "إرسال"],
        "technical": ["قاعدة بيانات", "api", "react", "node", "python", "mongodb", "تقنية", "لغة برمجة"]
    }
    
    # Calculate progress for each stage
    stage_progress = {}
    for stage_id, keywords in stage_keywords.items():
        matches = sum(1 for kw in keywords if kw in conversation_text)
        stage_progress[stage_id] = min(100, (matches / max(len(keywords) * 0.3, 1)) * 100)
    
    # Determine current stage
    completed_stages = []
    current_stage = "idea"
    
    for stage in CONVERSATION_STAGES[:-1]:  # Exclude 'ready'
        if stage_progress.get(stage["id"], 0) >= 50:
            completed_stages.append(stage["id"])
            current_stage_idx = CONVERSATION_STAGES.index(stage) + 1
            if current_stage_idx < len(CONVERSATION_STAGES):
                current_stage = CONVERSATION_STAGES[current_stage_idx]["id"]
    
    # Calculate overall progress
    total_progress = len(completed_stages) / (len(CONVERSATION_STAGES) - 1) * 100
    
    # Extract project summary
    project_summary = extract_project_summary(messages, idea)
    
    # Check if ready to generate
    ready_to_generate = total_progress >= 60 and len(messages) >= 4
    
    return {
        "current_stage": current_stage,
        "completed_stages": completed_stages,
        "stage_progress": stage_progress,
        "total_progress": min(100, total_progress),
        "ready_to_generate": ready_to_generate,
        "project_summary": project_summary,
        "stages": CONVERSATION_STAGES
    }

def extract_project_summary(messages: List[dict], idea: str) -> dict:
    """Extract project summary from conversation"""
    conversation_text = " ".join([m["content"] for m in messages])
    
    # Project type detection
    project_types = {
        "web_app": ["تطبيق ويب", "موقع", "web app", "website"],
        "mobile_app": ["تطبيق موبايل", "تطبيق جوال", "mobile app", "ios", "android"],
        "api": ["api", "خدمة", "service", "backend"],
        "desktop": ["برنامج سطح المكتب", "desktop"],
        "system": ["نظام", "منصة", "system", "platform"]
    }
    
    detected_type = "غير محدد"
    for ptype, keywords in project_types.items():
        if any(kw in conversation_text.lower() for kw in keywords):
            type_names = {"web_app": "تطبيق ويب", "mobile_app": "تطبيق موبايل", "api": "API", "desktop": "برنامج سطح مكتب", "system": "نظام متكامل"}
            detected_type = type_names.get(ptype, ptype)
            break
    
    # Extract features (look for bullet points or numbered items)
    features = []
    feature_patterns = [
        r'[-•]\s*(.+?)(?=[-•]|\n|$)',
        r'\d+[.)-]\s*(.+?)(?=\d+[.)-]|\n|$)',
        r'(?:ميزة|خاصية|وظيفة)[:\s]+(.+?)(?=\n|$)'
    ]
    
    for pattern in feature_patterns:
        matches = re.findall(pattern, conversation_text)
        features.extend([m.strip() for m in matches if len(m.strip()) > 3 and len(m.strip()) < 100])
    
    # Remove duplicates and limit
    features = list(dict.fromkeys(features))[:6]
    
    # Detect technologies
    tech_keywords = {
        "React": ["react", "ريأكت"],
        "Node.js": ["node", "nodejs", "نود"],
        "Python": ["python", "بايثون"],
        "MongoDB": ["mongodb", "مونجو"],
        "PostgreSQL": ["postgres", "postgresql"],
        "Firebase": ["firebase", "فايربيس"],
        "Flutter": ["flutter", "فلاتر"],
        "Next.js": ["next", "nextjs"]
    }
    
    detected_tech = []
    for tech, keywords in tech_keywords.items():
        if any(kw in conversation_text.lower() for kw in keywords):
            detected_tech.append(tech)
    
    return {
        "type": detected_type,
        "features": features if features else ["لم يتم تحديد الميزات بعد"],
        "technologies": detected_tech if detected_tech else ["سيتم تحديدها لاحقاً"],
        "idea_summary": idea[:150] + "..." if len(idea) > 150 else idea
    }

def get_smart_suggestions(current_stage: str, conversation_text: str) -> List[dict]:
    """Generate smart suggestions based on current stage"""
    
    suggestions = {
        "idea": [
            {"text": "تطبيق ويب", "icon": "globe"},
            {"text": "تطبيق موبايل", "icon": "smartphone"},
            {"text": "API / Backend", "icon": "server"},
            {"text": "نظام متكامل", "icon": "layers"}
        ],
        "audience": [
            {"text": "مستخدمين عاديين", "icon": "users"},
            {"text": "شركات ومؤسسات", "icon": "building"},
            {"text": "مطورين", "icon": "code"},
            {"text": "متاجر إلكترونية", "icon": "shopping-cart"}
        ],
        "problem": [
            {"text": "توفير الوقت", "icon": "clock"},
            {"text": "تسهيل التواصل", "icon": "message-circle"},
            {"text": "إدارة البيانات", "icon": "database"},
            {"text": "أتمتة العمليات", "icon": "zap"}
        ],
        "features": [
            {"text": "تسجيل دخول", "icon": "log-in"},
            {"text": "لوحة تحكم", "icon": "layout-dashboard"},
            {"text": "إشعارات", "icon": "bell"},
            {"text": "بحث متقدم", "icon": "search"},
            {"text": "تقارير", "icon": "bar-chart"},
            {"text": "دردشة", "icon": "message-square"}
        ],
        "technical": [
            {"text": "React + Node.js", "icon": "code"},
            {"text": "Next.js", "icon": "triangle"},
            {"text": "Flutter", "icon": "smartphone"},
            {"text": "Python + FastAPI", "icon": "terminal"}
        ],
        "ready": [
            {"text": "نعم، ابدأ التوليد", "icon": "sparkles"},
            {"text": "أريد إضافة المزيد", "icon": "plus"}
        ]
    }
    
    return suggestions.get(current_stage, suggestions["features"])

# ==================== ERROR MESSAGES ====================

ERROR_MESSAGES = {
    "invalid_credentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    "email_exists": "هذا البريد الإلكتروني مسجل مسبقاً",
    "not_authenticated": "يرجى تسجيل الدخول للمتابعة",
    "token_expired": "انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجدداً",
    "invalid_token": "جلسة غير صالحة، يرجى تسجيل الدخول مجدداً",
    "user_not_found": "المستخدم غير موجود",
    "project_not_found": "المشروع غير موجود أو ليس لديك صلاحية الوصول إليه",
    "api_key_required": "يرجى إضافة مفتاح OpenRouter API أولاً من الإعدادات",
    "api_key_invalid": "مفتاح API غير صالح أو منتهي الصلاحية",
    "ai_connection_error": "تعذر الاتصال بخدمة الذكاء الاصطناعي، يرجى المحاولة لاحقاً",
    "ai_timeout": "استغرق الرد وقتاً طويلاً، يرجى المحاولة مجدداً",
    "rate_limit": "تم تجاوز الحد المسموح من الطلبات، يرجى الانتظار قليلاً",
    "model_not_available": "النموذج المحدد غير متاح حالياً، يرجى اختيار نموذج آخر",
    "insufficient_credits": "رصيد API غير كافٍ، يرجى شحن حسابك على OpenRouter",
    "generation_failed": "فشل في توليد المخرجات، يرجى المحاولة مجدداً",
    "outputs_not_found": "لم يتم توليد المخرجات بعد، ابدأ محادثة مع المساعد أولاً",
    "server_error": "حدث خطأ في الخادم، يرجى المحاولة لاحقاً"
}

def get_error_message(key: str, details: str = None) -> str:
    message = ERROR_MESSAGES.get(key, ERROR_MESSAGES["server_error"])
    if details:
        message = f"{message}: {details}"
    return message

# ==================== HELPERS ====================

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_fernet():
    key = ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY
    if len(key) != 44:
        key = base64.urlsafe_b64encode(hashlib.sha256(key).digest())
    return Fernet(key)

def encrypt_api_key(api_key: str) -> str:
    f = get_fernet()
    return f.encrypt(api_key.encode()).decode()

def decrypt_api_key(encrypted_key: str) -> str:
    f = get_fernet()
    return f.decrypt(encrypted_key.encode()).decode()

async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail=get_error_message("not_authenticated"))
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail=get_error_message("invalid_token"))
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail=get_error_message("user_not_found"))
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "created_at": user["created_at"]
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail=get_error_message("token_expired"))
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail=get_error_message("invalid_token"))

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserRegister, response: Response):
    email = user_data.email.lower()
    
    if len(user_data.password) < 6:
        raise HTTPException(status_code=400, detail="كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail=get_error_message("email_exists"))
    
    hashed = hash_password(user_data.password)
    user_doc = {
        "email": email,
        "password_hash": hashed,
        "name": user_data.name,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)
    
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=2592000, path="/")
    
    return {
        "id": user_id,
        "email": email,
        "name": user_data.name,
        "created_at": user_doc["created_at"]
    }

@api_router.post("/auth/login")
async def login(user_data: UserLogin, response: Response):
    email = user_data.email.lower()
    
    user = await db.users.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=401, detail=get_error_message("invalid_credentials"))
    
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail=get_error_message("invalid_credentials"))
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="none", max_age=604800, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="none", max_age=2592000, path="/")
    
    return {
        "id": user_id,
        "email": user["email"],
        "name": user["name"],
        "created_at": user["created_at"]
    }

@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")
    return {"message": "تم تسجيل الخروج بنجاح"}

@api_router.get("/auth/me")
async def get_me(request: Request):
    user = await get_current_user(request)
    return user

# ==================== PROVIDER CONFIG ====================

PROVIDER_CONFIG = {
    "openrouter": {
        "name": "OpenRouter",
        "name_ar": "OpenRouter",
        "base_url": "https://openrouter.ai/api/v1",
        "validate_url": "https://openrouter.ai/api/v1/models",
        "models_url": "https://openrouter.ai/api/v1/models",
        "key_prefix": "sk-or-",
        "key_help_url": "https://openrouter.ai/keys"
    },
    "openai": {
        "name": "OpenAI",
        "name_ar": "OpenAI",
        "base_url": "https://api.openai.com/v1",
        "validate_url": "https://api.openai.com/v1/models",
        "models_url": "https://api.openai.com/v1/models",
        "key_prefix": "sk-",
        "key_help_url": "https://platform.openai.com/api-keys"
    },
    "anthropic": {
        "name": "Anthropic",
        "name_ar": "Anthropic",
        "base_url": "https://api.anthropic.com/v1",
        "validate_url": "https://api.anthropic.com/v1/messages",
        "models_url": None,
        "key_prefix": "sk-ant-",
        "key_help_url": "https://console.anthropic.com/settings/keys"
    },
    "google": {
        "name": "Google AI",
        "name_ar": "Google AI",
        "base_url": "https://generativelanguage.googleapis.com/v1beta",
        "validate_url": "https://generativelanguage.googleapis.com/v1beta/models",
        "models_url": "https://generativelanguage.googleapis.com/v1beta/models",
        "key_prefix": "AI",
        "key_help_url": "https://aistudio.google.com/apikey"
    }
}

async def validate_provider_key(provider: str, api_key: str) -> bool:
    """Validate an API key for a given provider"""
    config = PROVIDER_CONFIG.get(provider)
    if not config:
        return False
    
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            if provider == "openrouter":
                resp = await http_client.get(config["validate_url"], headers={"Authorization": f"Bearer {api_key}"})
                return resp.status_code == 200
            elif provider == "openai":
                resp = await http_client.get(config["validate_url"], headers={"Authorization": f"Bearer {api_key}"})
                return resp.status_code == 200
            elif provider == "anthropic":
                resp = await http_client.post(
                    config["validate_url"],
                    headers={"x-api-key": api_key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
                    json={"model": "claude-3-haiku-20240307", "max_tokens": 1, "messages": [{"role": "user", "content": "hi"}]}
                )
                return resp.status_code in [200, 400]  # 400 = valid key but bad request is OK
            elif provider == "google":
                resp = await http_client.get(f"{config['validate_url']}?key={api_key}")
                return resp.status_code == 200
    except:
        pass
    return False

async def fetch_provider_models(provider: str, api_key: str) -> list:
    """Fetch available models for a specific provider"""
    models = []
    try:
        async with httpx.AsyncClient(timeout=15.0) as http_client:
            if provider == "openrouter":
                resp = await http_client.get(
                    "https://openrouter.ai/api/v1/models",
                    headers={"Authorization": f"Bearer {api_key}"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    provider_names = {
                        "openai": "OpenAI", "anthropic": "Anthropic", "google": "Google",
                        "meta-llama": "Meta", "mistralai": "Mistral", "cohere": "Cohere",
                        "perplexity": "Perplexity", "deepseek": "DeepSeek", "qwen": "Qwen"
                    }
                    for m in data.get("data", []):
                        model_id = m.get("id", "")
                        pricing = m.get("pricing", {})
                        prompt_price = float(pricing.get("prompt", "0") or "0")
                        prov = model_id.split("/")[0] if "/" in model_id else "unknown"
                        models.append({
                            "id": model_id,
                            "name": m.get("name", model_id),
                            "provider": provider_names.get(prov, prov.title()),
                            "is_free": prompt_price == 0,
                            "context_length": m.get("context_length", 0),
                            "source": "openrouter"
                        })
            elif provider == "openai":
                resp = await http_client.get(
                    "https://api.openai.com/v1/models",
                    headers={"Authorization": f"Bearer {api_key}"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    chat_models = [m for m in data.get("data", []) if "gpt" in m.get("id", "").lower()]
                    for m in chat_models:
                        models.append({
                            "id": f"openai/{m['id']}",
                            "name": m["id"].replace("-", " ").title(),
                            "provider": "OpenAI (Direct)",
                            "is_free": False,
                            "context_length": 128000,
                            "source": "openai"
                        })
            elif provider == "anthropic":
                # Anthropic doesn't have a models list endpoint, hardcode known models
                for m in [
                    {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet", "ctx": 200000},
                    {"id": "claude-3-haiku-20240307", "name": "Claude 3 Haiku", "ctx": 200000},
                    {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus", "ctx": 200000},
                ]:
                    models.append({
                        "id": f"anthropic/{m['id']}",
                        "name": m["name"],
                        "provider": "Anthropic (Direct)",
                        "is_free": False,
                        "context_length": m["ctx"],
                        "source": "anthropic"
                    })
            elif provider == "google":
                resp = await http_client.get(f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}")
                if resp.status_code == 200:
                    data = resp.json()
                    for m in data.get("models", []):
                        name = m.get("name", "")
                        display = m.get("displayName", name)
                        if "gemini" in name.lower():
                            model_id = name.replace("models/", "")
                            models.append({
                                "id": f"google/{model_id}",
                                "name": display,
                                "provider": "Google AI (Direct)",
                                "is_free": False,
                                "context_length": m.get("inputTokenLimit", 0),
                                "source": "google"
                            })
    except Exception as e:
        logger.error(f"Error fetching models for {provider}: {str(e)}")
    return models

async def call_provider_api(provider: str, api_key: str, model: str, messages: list, stream: bool = False, timeout: float = 60.0):
    """Make an API call to the correct provider. Returns (response_or_stream, error_str)"""
    # Strip provider prefix from model ID for direct calls
    raw_model = model.split("/", 1)[1] if "/" in model else model
    
    if provider == "openrouter":
        url = "https://openrouter.ai/api/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json",
                   "HTTP-Referer": "https://buildmap.app", "X-Title": "BuildMap"}
        body = {"model": model, "messages": messages, "max_tokens": 1500, "temperature": 0.7, "stream": stream}
        return url, headers, body
    
    elif provider == "openai":
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        body = {"model": raw_model, "messages": messages, "max_tokens": 1500, "temperature": 0.7, "stream": stream}
        return url, headers, body
    
    elif provider == "anthropic":
        url = "https://api.anthropic.com/v1/messages"
        headers = {"x-api-key": api_key, "anthropic-version": "2023-06-01", "content-type": "application/json"}
        # Convert OpenAI-style messages to Anthropic format
        system_msg = ""
        anthropic_msgs = []
        for m in messages:
            if m["role"] == "system":
                system_msg = m["content"]
            else:
                anthropic_msgs.append({"role": m["role"], "content": m["content"]})
        body = {"model": raw_model, "max_tokens": 1500, "messages": anthropic_msgs, "stream": stream}
        if system_msg:
            body["system"] = system_msg
        return url, headers, body
    
    elif provider == "google":
        # Google uses a different format
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{raw_model}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        # Convert to Google format
        contents = []
        system_instruction = None
        for m in messages:
            if m["role"] == "system":
                system_instruction = m["content"]
            else:
                role = "user" if m["role"] == "user" else "model"
                contents.append({"role": role, "parts": [{"text": m["content"]}]})
        body = {"contents": contents, "generationConfig": {"maxOutputTokens": 1500, "temperature": 0.7}}
        if system_instruction:
            body["systemInstruction"] = {"parts": [{"text": system_instruction}]}
        return url, headers, body
    
    return None, None, None

def determine_provider(model_id: str, user_keys: dict) -> tuple:
    """Determine which provider+key to use for a model. Returns (provider, api_key)"""
    model_prefix = model_id.split("/")[0] if "/" in model_id else ""
    
    # Try direct provider first (cheaper)
    direct_map = {"openai": "openai", "anthropic": "anthropic", "google": "google"}
    if model_prefix in direct_map:
        direct_provider = direct_map[model_prefix]
        if direct_provider in user_keys:
            return direct_provider, user_keys[direct_provider]
    
    # Fallback to OpenRouter
    if "openrouter" in user_keys:
        return "openrouter", user_keys["openrouter"]
    
    # Use any available key
    if user_keys:
        provider = next(iter(user_keys))
        return provider, user_keys[provider]
    
    return None, None

async def get_user_api_keys(user_id: str) -> dict:
    """Get all API keys for a user, returns {provider: decrypted_key}"""
    keys = {}
    cursor = db.api_keys.find({"user_id": user_id}, {"_id": 0, "provider": 1, "encrypted_key": 1})
    async for doc in cursor:
        try:
            keys[doc["provider"]] = decrypt_api_key(doc["encrypted_key"])
        except:
            pass
    return keys

# ==================== API KEY ROUTES ====================

@api_router.post("/api-keys")
async def create_api_key(key_data: APIKeyCreate, request: Request):
    user = await get_current_user(request)
    
    provider = key_data.provider
    if provider not in PROVIDER_CONFIG:
        raise HTTPException(status_code=400, detail="مزود غير مدعوم")
    
    # Validate API key
    valid = await validate_provider_key(provider, key_data.api_key)
    if not valid:
        raise HTTPException(status_code=400, detail=get_error_message("api_key_invalid"))
    
    # Delete existing key for this provider only
    await db.api_keys.delete_many({"user_id": user["id"], "provider": provider})
    
    encrypted = encrypt_api_key(key_data.api_key)
    key_doc = {
        "user_id": user["id"],
        "encrypted_key": encrypted,
        "provider": provider,
        "default_model": key_data.default_model,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.api_keys.insert_one(key_doc)
    
    return {
        "id": str(result.inserted_id),
        "provider": provider,
        "default_model": key_data.default_model,
        "created_at": key_doc["created_at"],
        "has_key": True
    }

@api_router.get("/api-keys")
async def get_api_keys(request: Request):
    user = await get_current_user(request)
    keys = await db.api_keys.find(
        {"user_id": user["id"]},
        {"_id": 1, "provider": 1, "default_model": 1, "created_at": 1}
    ).to_list(10)
    
    if not keys:
        return {"has_key": False, "providers": []}
    
    providers = []
    for k in keys:
        providers.append({
            "id": str(k["_id"]),
            "provider": k["provider"],
            "provider_name": PROVIDER_CONFIG.get(k["provider"], {}).get("name", k["provider"]),
            "default_model": k["default_model"],
            "created_at": k["created_at"]
        })
    
    return {
        "has_key": True,
        "providers": providers,
        # Backward compat
        "provider": keys[0]["provider"],
        "default_model": keys[0]["default_model"],
        "id": str(keys[0]["_id"]),
        "created_at": keys[0]["created_at"]
    }

@api_router.delete("/api-keys")
async def delete_api_key(request: Request):
    user = await get_current_user(request)
    await db.api_keys.delete_many({"user_id": user["id"]})
    return {"message": "تم حذف جميع المفاتيح"}

@api_router.delete("/api-keys/{provider}")
async def delete_api_key_by_provider(provider: str, request: Request):
    user = await get_current_user(request)
    result = await db.api_keys.delete_many({"user_id": user["id"], "provider": provider})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="المفتاح غير موجود")
    return {"message": f"تم حذف مفتاح {provider}"}

@api_router.get("/providers")
async def get_providers():
    """Get available API provider configurations"""
    return [
        {
            "id": pid,
            "name": cfg["name"],
            "name_ar": cfg["name_ar"],
            "key_prefix": cfg["key_prefix"],
            "key_help_url": cfg["key_help_url"]
        }
        for pid, cfg in PROVIDER_CONFIG.items()
    ]

# ==================== DYNAMIC MODELS ====================

@api_router.get("/models")
async def get_available_models(request: Request):
    try:
        user = await get_current_user(request)
        user_keys = await get_user_api_keys(user["id"])
        
        if user_keys:
            all_models = []
            seen_ids = set()
            
            for provider, api_key in user_keys.items():
                provider_models = await fetch_provider_models(provider, api_key)
                for m in provider_models:
                    if m["id"] not in seen_ids:
                        seen_ids.add(m["id"])
                        all_models.append(m)
            
            if all_models:
                all_models.sort(key=lambda x: (not x.get("is_free", False), x.get("provider", ""), x.get("name", "")))
                return all_models
    except:
        pass
    
    return [
        {"id": "openai/gpt-4o", "name": "GPT-4o", "provider": "OpenAI", "is_free": False, "context_length": 128000, "source": "default"},
        {"id": "openai/gpt-4o-mini", "name": "GPT-4o Mini", "provider": "OpenAI", "is_free": False, "context_length": 128000, "source": "default"},
        {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet", "provider": "Anthropic", "is_free": False, "context_length": 200000, "source": "default"},
        {"id": "google/gemini-pro-1.5", "name": "Gemini Pro 1.5", "provider": "Google", "is_free": False, "context_length": 1000000, "source": "default"},
    ]

# ==================== PROJECT ROUTES ====================

@api_router.post("/projects")
async def create_project(project_data: ProjectCreate, request: Request):
    user = await get_current_user(request)
    
    api_key = await db.api_keys.find_one({"user_id": user["id"]})
    default_model = api_key["default_model"] if api_key else "openai/gpt-4o"
    
    project_doc = {
        "user_id": user["id"],
        "title": project_data.title,
        "idea": project_data.idea,
        "selected_model": default_model,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.projects.insert_one(project_doc)
    project_id = str(result.inserted_id)
    
    # Create initial system message with Vibe Coding style
    system_message = {
        "project_id": project_id,
        "role": "assistant",
        "content": f"""مرحباً! أنا مساعدك في BuildMap.

سأساعدك في تحويل فكرتك إلى مشروع تقني متكامل. لنبدأ بفهم رؤيتك بشكل أعمق.

فكرتك: {project_data.idea}

أولاً، ما نوع المشروع الذي تتخيله؟""",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(system_message)
    
    return {
        "id": project_id,
        "title": project_data.title,
        "idea": project_data.idea,
        "selected_model": default_model,
        "created_at": project_doc["created_at"],
        "updated_at": project_doc["updated_at"],
        "has_outputs": False
    }

@api_router.get("/projects")
async def get_projects(request: Request):
    user = await get_current_user(request)
    
    projects = await db.projects.find(
        {"user_id": user["id"]},
        {"_id": 1, "title": 1, "idea": 1, "selected_model": 1, "created_at": 1, "updated_at": 1}
    ).sort("updated_at", -1).to_list(100)
    
    result = []
    for p in projects:
        output = await db.outputs.find_one({"project_id": str(p["_id"])})
        result.append({
            "id": str(p["_id"]),
            "title": p["title"],
            "idea": p["idea"],
            "selected_model": p["selected_model"],
            "created_at": p["created_at"],
            "updated_at": p["updated_at"],
            "has_outputs": output is not None
        })
    
    return result

@api_router.get("/projects/{project_id}")
async def get_project(project_id: str, request: Request):
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    output = await db.outputs.find_one({"project_id": project_id})
    
    return {
        "id": str(project["_id"]),
        "title": project["title"],
        "idea": project["idea"],
        "selected_model": project["selected_model"],
        "created_at": project["created_at"],
        "updated_at": project["updated_at"],
        "has_outputs": output is not None
    }

@api_router.patch("/projects/{project_id}")
async def update_project(project_id: str, update_data: ProjectUpdate, request: Request):
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    update_dict = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if update_data.title:
        update_dict["title"] = update_data.title
    if update_data.selected_model:
        update_dict["selected_model"] = update_data.selected_model
    
    await db.projects.update_one({"_id": ObjectId(project_id)}, {"$set": update_dict})
    return {"message": "تم التحديث"}

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, request: Request):
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    await db.projects.delete_one({"_id": ObjectId(project_id)})
    await db.messages.delete_many({"project_id": project_id})
    await db.outputs.delete_many({"project_id": project_id})
    
    return {"message": "تم حذف المشروع"}

# ==================== CONVERSATION ANALYSIS ENDPOINT ====================

@api_router.get("/projects/{project_id}/analysis")
async def get_conversation_analysis(project_id: str, request: Request):
    """Get conversation analysis including progress, suggestions, and project summary"""
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    # Get messages
    messages = await db.messages.find(
        {"project_id": project_id},
        {"_id": 0, "role": 1, "content": 1}
    ).to_list(100)
    
    # Basic conversation analysis
    analysis = analyze_conversation_progress(messages, project["idea"])
    
    # Advanced AI analysis
    ai_analysis = ai_full_analysis(messages, project["idea"])
    
    # Merge NLP features into project summary
    if ai_analysis.get("features"):
        nlp_features = [f["text"] for f in ai_analysis["features"]]
        existing = analysis["project_summary"].get("features", [])
        merged = list(dict.fromkeys(nlp_features + existing))[:8]
        analysis["project_summary"]["features"] = merged
    
    if ai_analysis.get("technologies"):
        nlp_tech = [t["name"] for t in ai_analysis["technologies"]]
        existing = analysis["project_summary"].get("technologies", [])
        merged = list(dict.fromkeys(nlp_tech + existing))[:8]
        analysis["project_summary"]["technologies"] = merged
    
    # Add advanced data
    analysis["project_summary"]["type"] = ai_analysis.get("project_type", {}).get("name_ar", analysis["project_summary"]["type"])
    analysis["complexity"] = ai_analysis.get("complexity", {})
    analysis["suggested_skills"] = ai_analysis.get("suggested_skills", [])
    analysis["verification"] = ai_analysis.get("verification", [])
    analysis["user_type"] = ai_analysis.get("user_type", {})
    
    # Get smart suggestions
    suggestions = get_smart_suggestions(analysis["current_stage"], " ".join([m["content"] for m in messages]))
    
    return {
        **analysis,
        "suggestions": suggestions
    }

# ==================== MESSAGE ROUTES ====================

@api_router.get("/projects/{project_id}/messages")
async def get_messages(project_id: str, request: Request):
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    messages = await db.messages.find(
        {"project_id": project_id},
        {"_id": 1, "role": 1, "content": 1, "created_at": 1}
    ).sort("created_at", 1).to_list(1000)
    
    return [
        {
            "id": str(m["_id"]),
            "role": m["role"],
            "content": m["content"],
            "created_at": m["created_at"]
        }
        for m in messages
    ]

@api_router.post("/projects/{project_id}/messages")
async def send_message(project_id: str, message_data: MessageCreate, request: Request):
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    # Determine provider and key for the selected model
    user_keys = await get_user_api_keys(user["id"])
    provider, api_key = determine_provider(project["selected_model"], user_keys)
    if not provider:
        raise HTTPException(status_code=400, detail=get_error_message("api_key_required"))
    
    # Save user message
    user_message = {
        "project_id": project_id,
        "role": "user",
        "content": message_data.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(user_message)
    
    # Get conversation history
    history = await db.messages.find(
        {"project_id": project_id},
        {"_id": 0, "role": 1, "content": 1}
    ).sort("created_at", -1).limit(15).to_list(15)
    history.reverse()
    
    # Analyze current progress
    all_messages = await db.messages.find(
        {"project_id": project_id},
        {"_id": 0, "role": 1, "content": 1}
    ).to_list(100)
    analysis = analyze_conversation_progress(all_messages, project["idea"])
    
    # Advanced AI analysis for enhanced prompting
    ai_analysis = ai_full_analysis(all_messages, project["idea"])
    
    # Pick agent role based on current stage
    stage_agent_map = {
        "idea": AgentRole.PLANNER,
        "audience": AgentRole.PLANNER,
        "problem": AgentRole.EVALUATOR,
        "features": AgentRole.ARCHITECT,
        "technical": AgentRole.ARCHITECT,
        "ready": AgentRole.REVIEWER
    }
    active_agent = AGENTS.get(stage_agent_map.get(analysis["current_stage"], AgentRole.PLANNER))
    
    # Build skills context
    skills_context = ""
    if ai_analysis.get("suggested_skills"):
        skill_names = [s["name_ar"] for s in ai_analysis["suggested_skills"][:3]]
        skills_context = f"\nالمهارات المقترحة للمشروع: {', '.join(skill_names)}"
    
    # Build complexity context
    complexity_context = ""
    if ai_analysis.get("complexity"):
        c = ai_analysis["complexity"]
        complexity_context = f"\nتعقيد المشروع: {c.get('level_ar', '')} | الوقت المقدر: {c.get('estimated_time', '')}"
    
    # Build verification context
    verification_context = ""
    if ai_analysis.get("verification"):
        failed = [v for v in ai_analysis["verification"] if not v.get("passed")]
        if failed:
            verification_context = "\nملاحظات التحقق: " + " | ".join([v["message"] for v in failed])
    
    # Build smart system prompt based on stage
    stage_prompts = {
        "idea": "ركز على فهم نوع المشروع والرؤية العامة. اسأل عن نوع التطبيق وما يميزه.",
        "audience": "اسأل عن الفئة المستهدفة واحتياجاتهم. من سيستخدم هذا المشروع؟",
        "problem": "استكشف المشكلة التي يحلها المشروع. ما القيمة التي سيقدمها؟",
        "features": "حدد الميزات الرئيسية والإضافية. ما الوظائف الأساسية؟",
        "technical": "ناقش الجوانب التقنية: التقنيات، قاعدة البيانات، البنية.",
        "ready": "المشروع جاهز للتوليد. اعرض ملخصاً واسأل إن كان يريد إضافة شيء."
    }
    
    current_stage_prompt = stage_prompts.get(analysis["current_stage"], "")
    
    system_prompt = f"""أنت مساعد ذكي في منصة BuildMap متخصص في تحويل الأفكار إلى مشاريع تقنية.

دورك الحالي: {active_agent.name_ar} - {active_agent.description}

{active_agent.system_prompt}

أسلوبك:
- محادثة طبيعية وودية
- أسئلة ذكية ومحددة (سؤال أو اثنين في كل رد)
- لا تكرر نفسك
- قدم اقتراحات مفيدة
- استخدم التنسيق المناسب

المرحلة الحالية: {analysis["current_stage"]}
التقدم: {analysis["total_progress"]:.0f}%

{current_stage_prompt}
{skills_context}
{complexity_context}
{verification_context}

عندما تشعر أن المعلومات كافية (تقدم 70% أو أكثر)، أخبر المستخدم أنه يمكنه توليد المخرجات الآن وأضف:
[READY_TO_GENERATE]

تحدث بالعربية."""

    messages_for_api = [{"role": "system", "content": system_prompt}]
    for msg in history:
        messages_for_api.append({"role": msg["role"], "content": msg["content"]})
    
    try:
        url, headers, body = await call_provider_api(provider, api_key, project["selected_model"], messages_for_api, stream=False)
        async with httpx.AsyncClient(timeout=60.0) as http_client:
            response = await http_client.post(url, headers=headers, json=body)
            
            if response.status_code == 401:
                raise HTTPException(status_code=400, detail=get_error_message("api_key_invalid"))
            elif response.status_code == 402:
                raise HTTPException(status_code=400, detail=get_error_message("insufficient_credits"))
            elif response.status_code == 429:
                raise HTTPException(status_code=429, detail=get_error_message("rate_limit"))
            elif response.status_code != 200:
                raise HTTPException(status_code=500, detail=get_error_message("ai_connection_error"))
            
            result = response.json()
            # Extract content based on provider format
            if provider == "anthropic":
                assistant_content = result.get("content", [{}])[0].get("text", "")
            elif provider == "google":
                assistant_content = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            else:
                assistant_content = result["choices"][0]["message"]["content"]
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail=get_error_message("ai_timeout"))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=get_error_message("ai_connection_error"))
    
    ready_to_generate = "[READY_TO_GENERATE]" in assistant_content
    clean_content = assistant_content.replace("[READY_TO_GENERATE]", "").strip()
    
    assistant_message = {
        "project_id": project_id,
        "role": "assistant",
        "content": clean_content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.messages.insert_one(assistant_message)
    
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Get updated analysis
    all_messages.append({"role": "user", "content": message_data.content})
    all_messages.append({"role": "assistant", "content": clean_content})
    updated_analysis = analyze_conversation_progress(all_messages, project["idea"])
    
    return {
        "id": str(result.inserted_id),
        "role": "assistant",
        "content": clean_content,
        "created_at": assistant_message["created_at"],
        "ready_to_generate": ready_to_generate or updated_analysis["total_progress"] >= 70,
        "analysis": updated_analysis
    }

# ==================== STREAMING CHAT ====================

async def build_chat_context(project_id: str, user_id: str, message_content: str):
    """Shared logic: save user message, build system prompt, return context needed for AI call"""
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user_id})
    if not project:
        return None
    
    user_keys = await get_user_api_keys(user_id)
    if not user_keys:
        return None
    
    provider, api_key = determine_provider(project["selected_model"], user_keys)
    if not provider:
        return None
    
    # Save user message
    user_message = {
        "project_id": project_id,
        "role": "user",
        "content": message_content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(user_message)
    
    # Get conversation history
    history = await db.messages.find(
        {"project_id": project_id},
        {"_id": 0, "role": 1, "content": 1}
    ).sort("created_at", -1).limit(15).to_list(15)
    history.reverse()
    
    # Analyze progress
    all_messages = await db.messages.find(
        {"project_id": project_id},
        {"_id": 0, "role": 1, "content": 1}
    ).to_list(100)
    analysis = analyze_conversation_progress(all_messages, project["idea"])
    ai_analysis = ai_full_analysis(all_messages, project["idea"])
    
    stage_agent_map = {
        "idea": AgentRole.PLANNER, "audience": AgentRole.PLANNER,
        "problem": AgentRole.EVALUATOR, "features": AgentRole.ARCHITECT,
        "technical": AgentRole.ARCHITECT, "ready": AgentRole.REVIEWER
    }
    active_agent = AGENTS.get(stage_agent_map.get(analysis["current_stage"], AgentRole.PLANNER))
    
    skills_context = ""
    if ai_analysis.get("suggested_skills"):
        skill_names = [s["name_ar"] for s in ai_analysis["suggested_skills"][:3]]
        skills_context = f"\nالمهارات المقترحة للمشروع: {', '.join(skill_names)}"
    
    complexity_context = ""
    if ai_analysis.get("complexity"):
        c = ai_analysis["complexity"]
        complexity_context = f"\nتعقيد المشروع: {c.get('level_ar', '')} | الوقت المقدر: {c.get('estimated_time', '')}"
    
    verification_context = ""
    if ai_analysis.get("verification"):
        failed = [v for v in ai_analysis["verification"] if not v.get("passed")]
        if failed:
            verification_context = "\nملاحظات التحقق: " + " | ".join([v["message"] for v in failed])
    
    stage_prompts = {
        "idea": "ركز على فهم نوع المشروع والرؤية العامة. اسأل عن نوع التطبيق وما يميزه.",
        "audience": "اسأل عن الفئة المستهدفة واحتياجاتهم. من سيستخدم هذا المشروع؟",
        "problem": "استكشف المشكلة التي يحلها المشروع. ما القيمة التي سيقدمها؟",
        "features": "حدد الميزات الرئيسية والإضافية. ما الوظائف الأساسية؟",
        "technical": "ناقش الجوانب التقنية: التقنيات، قاعدة البيانات، البنية.",
        "ready": "المشروع جاهز للتوليد. اعرض ملخصاً واسأل إن كان يريد إضافة شيء."
    }
    current_stage_prompt = stage_prompts.get(analysis["current_stage"], "")
    
    system_prompt = f"""أنت مساعد ذكي في منصة BuildMap متخصص في تحويل الأفكار إلى مشاريع تقنية.

دورك الحالي: {active_agent.name_ar} - {active_agent.description}

{active_agent.system_prompt}

أسلوبك:
- محادثة طبيعية وودية
- أسئلة ذكية ومحددة (سؤال أو اثنين في كل رد)
- لا تكرر نفسك
- قدم اقتراحات مفيدة
- استخدم التنسيق المناسب

المرحلة الحالية: {analysis["current_stage"]}
التقدم: {analysis["total_progress"]:.0f}%

{current_stage_prompt}
{skills_context}
{complexity_context}
{verification_context}

عندما تشعر أن المعلومات كافية (تقدم 70% أو أكثر)، أخبر المستخدم أنه يمكنه توليد المخرجات الآن وأضف:
[READY_TO_GENERATE]

تحدث بالعربية."""

    messages_for_api = [{"role": "system", "content": system_prompt}]
    for msg in history:
        messages_for_api.append({"role": msg["role"], "content": msg["content"]})
    
    return {
        "api_key": api_key,
        "provider": provider,
        "model": project["selected_model"],
        "messages_for_api": messages_for_api,
        "project": project,
        "analysis": analysis,
        "all_messages": all_messages,
    }

@api_router.post("/projects/{project_id}/messages/stream")
async def stream_message(project_id: str, message_data: MessageCreate, request: Request):
    """Stream AI response using Server-Sent Events"""
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    api_key_doc = await db.api_keys.find_one({"user_id": user["id"]})
    if not api_key_doc:
        raise HTTPException(status_code=400, detail=get_error_message("api_key_required"))
    
    ctx = await build_chat_context(project_id, user["id"], message_data.content)
    if not ctx:
        raise HTTPException(status_code=400, detail=get_error_message("server_error"))
    
    async def event_generator():
        full_content = ""
        try:
            async with httpx.AsyncClient(timeout=120.0) as http_client:
                url, headers, body = await call_provider_api(
                    ctx["provider"], ctx["api_key"], ctx["model"], ctx["messages_for_api"], stream=True
                )
                async with http_client.stream("POST", url, headers=headers, json=body) as response:
                    if response.status_code != 200:
                        error_body = b""
                        async for chunk in response.aiter_bytes():
                            error_body += chunk
                        error_msg = "ai_connection_error"
                        if response.status_code == 401:
                            error_msg = "api_key_invalid"
                        elif response.status_code == 402:
                            error_msg = "insufficient_credits"
                        elif response.status_code == 429:
                            error_msg = "rate_limit"
                        yield f"data: {json.dumps({'type': 'error', 'content': get_error_message(error_msg)})}\n\n"
                        return
                    
                    # Handle different provider streaming formats
                    if ctx["provider"] == "google":
                        # Google doesn't support streaming the same way, read full response
                        full_body = b""
                        async for chunk in response.aiter_bytes():
                            full_body += chunk
                        try:
                            data = json.loads(full_body)
                            text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                            if text:
                                full_content = text
                                yield f"data: {json.dumps({'type': 'chunk', 'content': text})}\n\n"
                        except:
                            yield f"data: {json.dumps({'type': 'error', 'content': get_error_message('ai_connection_error')})}\n\n"
                            return
                    elif ctx["provider"] == "anthropic":
                        async for line in response.aiter_lines():
                            if not line.startswith("data: "):
                                continue
                            data_str = line[6:]
                            if data_str.strip() == "[DONE]":
                                break
                            try:
                                chunk_data = json.loads(data_str)
                                event_type = chunk_data.get("type", "")
                                if event_type == "content_block_delta":
                                    text = chunk_data.get("delta", {}).get("text", "")
                                    if text:
                                        full_content += text
                                        yield f"data: {json.dumps({'type': 'chunk', 'content': text})}\n\n"
                                elif event_type == "message_stop":
                                    break
                            except json.JSONDecodeError:
                                continue
                    else:
                        # OpenRouter / OpenAI format
                        async for line in response.aiter_lines():
                            if not line.startswith("data: "):
                                continue
                            data_str = line[6:]
                            if data_str.strip() == "[DONE]":
                                break
                            try:
                                chunk_data = json.loads(data_str)
                                delta = chunk_data.get("choices", [{}])[0].get("delta", {})
                                content_piece = delta.get("content", "")
                                if content_piece:
                                    full_content += content_piece
                                    yield f"data: {json.dumps({'type': 'chunk', 'content': content_piece})}\n\n"
                            except json.JSONDecodeError:
                                continue
            
            # Save the complete assistant message
            ready_to_generate = "[READY_TO_GENERATE]" in full_content
            clean_content = full_content.replace("[READY_TO_GENERATE]", "").strip()
            
            assistant_message = {
                "project_id": project_id,
                "role": "assistant",
                "content": clean_content,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            result = await db.messages.insert_one(assistant_message)
            
            await db.projects.update_one(
                {"_id": ObjectId(project_id)},
                {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            
            # Get updated analysis
            all_msgs = ctx["all_messages"]
            all_msgs.append({"role": "user", "content": message_data.content})
            all_msgs.append({"role": "assistant", "content": clean_content})
            updated_analysis = analyze_conversation_progress(all_msgs, ctx["project"]["idea"])
            
            # Send final event with metadata
            yield f"data: {json.dumps({'type': 'done', 'id': str(result.inserted_id), 'created_at': assistant_message['created_at'], 'ready_to_generate': ready_to_generate or updated_analysis['total_progress'] >= 70, 'analysis': updated_analysis})}\n\n"
        
        except httpx.TimeoutException:
            yield f"data: {json.dumps({'type': 'error', 'content': get_error_message('ai_timeout')})}\n\n"
        except Exception as e:
            logger.error(f"Streaming error: {str(e)}")
            yield f"data: {json.dumps({'type': 'error', 'content': get_error_message('ai_connection_error')})}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )

# ==================== OUTPUT GENERATION ====================

@api_router.post("/projects/{project_id}/generate")
async def generate_outputs(project_id: str, request: Request):
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    api_key_doc = await db.api_keys.find_one({"user_id": user["id"]})
    if not api_key_doc:
        raise HTTPException(status_code=400, detail=get_error_message("api_key_required"))
    
    user_keys = await get_user_api_keys(user["id"])
    provider, api_key = determine_provider(project["selected_model"], user_keys)
    if not provider:
        raise HTTPException(status_code=400, detail=get_error_message("api_key_required"))
    
    messages = await db.messages.find(
        {"project_id": project_id},
        {"_id": 0, "role": 1, "content": 1}
    ).to_list(100)
    
    conversation_text = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    
    # Get advanced analysis for richer context
    ai_analysis = ai_full_analysis(messages, project["idea"])
    project_type = ai_analysis.get("project_type", {}).get("name_ar", "غير محدد")
    complexity = ai_analysis.get("complexity", {}).get("level_ar", "متوسط")
    features_list = ", ".join([f["text"] for f in ai_analysis.get("features", [])[:6]])
    tech_list = ", ".join([t["name"] for t in ai_analysis.get("technologies", [])])
    
    analysis_context = f"""
معلومات التحليل:
- نوع المشروع: {project_type}
- التعقيد: {complexity}
- الميزات: {features_list or 'لم يتم تحديدها'}
- التقنيات: {tech_list or 'لم يتم تحديدها'}
"""
    
    outputs = {}
    
    output_prompts = {
        "frontend_readme": """بناءً على المحادثة والتحليل، أنشئ ملف README-Frontend.md احترافي يتضمن:
# اسم المشروع - Frontend

## نظرة عامة
## المكونات الرئيسية
## هيكل الملفات
## التقنيات المستخدمة
## تعليمات التشغيل
## المتغيرات البيئية

{analysis_context}

المحادثة:
{conversation}

اكتب بتنسيق Markdown احترافي.""",
        
        "backend_readme": """بناءً على المحادثة والتحليل، أنشئ ملف README-Backend.md احترافي يتضمن:
# اسم المشروع - Backend

## نظرة عامة
## API Endpoints (مع الأمثلة)
## هيكل قاعدة البيانات
## التقنيات المستخدمة
## تعليمات التشغيل
## المتغيرات البيئية

{analysis_context}

المحادثة:
{conversation}

اكتب بتنسيق Markdown احترافي.""",
        
        "plan": """بناءً على المحادثة والتحليل، أنشئ خطة عمل مفصلة:
# خطة تنفيذ المشروع

## المرحلة 1: الإعداد
## المرحلة 2: التطوير الأساسي
## المرحلة 3: الميزات الإضافية
## المرحلة 4: الاختبار
## المرحلة 5: الإطلاق

لكل مرحلة: المهام، المدة المقدرة، المخرجات

{analysis_context}

المحادثة:
{conversation}""",
        
        "skills": """بناءً على المحادثة والتحليل، حدد المهارات المطلوبة:
# المهارات والموارد التعليمية

## المهارات التقنية المطلوبة
(لكل مهارة: الاسم، المستوى المطلوب، موارد تعليمية)

## الأدوات والبرمجيات
## نصائح للتعلم

{analysis_context}

المحادثة:
{conversation}""",
        
        "evaluation": """بناءً على المحادثة والتحليل، قدم تقييم SWOT:
# تقييم المشروع

## نقاط القوة
## نقاط الضعف
## الفرص
## التهديدات
## التوصيات
## تقييم الجدوى: X/10

{analysis_context}

المحادثة:
{conversation}""",
        
        "mindmap": """بناءً على المحادثة والتحليل، أنشئ خريطة ذهنية JSON:
{{
  "title": "اسم المشروع",
  "children": [
    {{"title": "الميزات", "children": [...]}},
    {{"title": "التقنيات", "children": [...]}},
    {{"title": "المراحل", "children": [...]}}
  ]
}}

{analysis_context}

المحادثة:
{conversation}

أعد JSON فقط."""
    }
    
    async with httpx.AsyncClient(timeout=120.0) as http_client:
        for key, prompt in output_prompts.items():
            try:
                gen_messages = [{"role": "user", "content": prompt.format(conversation=conversation_text, analysis_context=analysis_context)}]
                url, headers, body = await call_provider_api(provider, api_key, project["selected_model"], gen_messages, stream=False)
                # Override max_tokens for generation
                if "max_tokens" in body:
                    body["max_tokens"] = 3000
                if "generationConfig" in body:
                    body["generationConfig"]["maxOutputTokens"] = 3000
                body["temperature"] = 0.5 if "temperature" in body else body.get("temperature", 0.5)
                if "generationConfig" in body:
                    body["generationConfig"]["temperature"] = 0.5
                
                response = await http_client.post(url, headers=headers, json=body)
                
                if response.status_code == 200:
                    result = response.json()
                    if provider == "anthropic":
                        outputs[key] = result.get("content", [{}])[0].get("text", "تعذر توليد هذا المحتوى")
                    elif provider == "google":
                        outputs[key] = result.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "تعذر توليد هذا المحتوى")
                    else:
                        outputs[key] = result["choices"][0]["message"]["content"]
                else:
                    outputs[key] = "تعذر توليد هذا المحتوى"
            except Exception as e:
                logger.error(f"Error generating {key}: {str(e)}")
                outputs[key] = "تعذر توليد هذا المحتوى"
    
    output_doc = {
        "project_id": project_id,
        "frontend_readme": outputs.get("frontend_readme", ""),
        "backend_readme": outputs.get("backend_readme", ""),
        "plan": outputs.get("plan", ""),
        "skills": outputs.get("skills", ""),
        "evaluation": outputs.get("evaluation", ""),
        "mindmap": outputs.get("mindmap", ""),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.outputs.update_one(
        {"project_id": project_id},
        {"$set": output_doc},
        upsert=True
    )
    
    return output_doc

@api_router.get("/projects/{project_id}/outputs")
async def get_outputs(project_id: str, request: Request):
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    output = await db.outputs.find_one({"project_id": project_id}, {"_id": 0})
    
    if not output:
        raise HTTPException(status_code=404, detail=get_error_message("outputs_not_found"))
    
    return output

# ==================== ZIP EXPORT ====================

@api_router.get("/projects/{project_id}/export")
async def export_project_zip(project_id: str, request: Request):
    """Export all project outputs as a ZIP file"""
    user = await get_current_user(request)
    
    try:
        project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    except:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    if not project:
        raise HTTPException(status_code=404, detail=get_error_message("project_not_found"))
    
    output = await db.outputs.find_one({"project_id": project_id}, {"_id": 0})
    if not output:
        raise HTTPException(status_code=404, detail=get_error_message("outputs_not_found"))
    
    # Get conversation for context
    messages = await db.messages.find(
        {"project_id": project_id},
        {"_id": 0, "role": 1, "content": 1, "created_at": 1}
    ).sort("created_at", 1).to_list(1000)
    
    # Advanced analysis
    ai_analysis = ai_full_analysis(messages, project["idea"])
    
    # Build ZIP in memory
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zf:
        # Output files
        file_map = {
            "README-Frontend.md": output.get("frontend_readme", ""),
            "README-Backend.md": output.get("backend_readme", ""),
            "Plan.md": output.get("plan", ""),
            "Skills.md": output.get("skills", ""),
            "Evaluation.md": output.get("evaluation", ""),
            "MindMap.json": output.get("mindmap", ""),
        }
        
        for filename, content in file_map.items():
            if content:
                zf.writestr(filename, content)
        
        # Add conversation log
        conversation_lines = []
        for msg in messages:
            role = "المستخدم" if msg["role"] == "user" else "المساعد"
            conversation_lines.append(f"## {role}\n{msg['content']}\n")
        if conversation_lines:
            zf.writestr("Conversation.md", f"# سجل المحادثة\n\n" + "\n---\n\n".join(conversation_lines))
        
        # Add analysis summary
        analysis_md = f"""# تحليل المشروع - {project['title']}

## نوع المشروع
{ai_analysis.get('project_type', {}).get('name_ar', 'غير محدد')}

## التعقيد
- المستوى: {ai_analysis.get('complexity', {}).get('level_ar', 'غير محدد')}
- الوقت المقدر: {ai_analysis.get('complexity', {}).get('estimated_time', 'غير محدد')}
- حجم الفريق المقترح: {ai_analysis.get('complexity', {}).get('team_size', 1)}

## الميزات المكتشفة
"""
        for f in ai_analysis.get("features", []):
            analysis_md += f"- {f['text']} (ثقة: {f['confidence']:.0%})\n"
        
        analysis_md += "\n## التقنيات المكتشفة\n"
        for t in ai_analysis.get("technologies", []):
            analysis_md += f"- {t['name']}\n"
        
        analysis_md += "\n## المهارات المقترحة\n"
        for s in ai_analysis.get("suggested_skills", []):
            skill = SKILLS_LIBRARY.get(s["id"])
            if skill:
                analysis_md += f"\n### {s['name_ar']}\n"
                for step in skill["steps"]:
                    analysis_md += f"- {step}\n"
        
        analysis_md += "\n## نتائج التحقق\n"
        for v in ai_analysis.get("verification", []):
            status = "نجح" if v["passed"] else "يحتاج تحسين"
            analysis_md += f"- {v['message']} ({status})\n"
        
        zf.writestr("Analysis.md", analysis_md)
    
    buffer.seek(0)
    
    safe_title = re.sub(r'[^\w\s-]', '', project["title"]).strip().replace(' ', '_')
    filename = f"BuildMap_{safe_title}.zip"
    
    return StreamingResponse(
        buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "BuildMap API", "version": "2.0.0"}

app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["https://buildmap-ideas.preview.emergentagent.com", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.api_keys.create_index("user_id")
    await db.projects.create_index("user_id")
    await db.messages.create_index("project_id")
    await db.outputs.create_index("project_id", unique=True)
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
