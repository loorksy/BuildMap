from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
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

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    created_at: str

class APIKeyCreate(BaseModel):
    api_key: str
    default_model: str = "openai/gpt-4"

class APIKeyResponse(BaseModel):
    id: str
    provider: str
    default_model: str
    created_at: str
    has_key: bool

class ProjectCreate(BaseModel):
    title: str
    idea: str

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    selected_model: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    title: str
    idea: str
    selected_model: str
    created_at: str
    updated_at: str
    has_outputs: bool

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str

class OutputResponse(BaseModel):
    id: str
    project_id: str
    frontend_readme: Optional[str] = None
    backend_readme: Optional[str] = None
    plan: Optional[str] = None
    skills: Optional[str] = None
    evaluation: Optional[str] = None
    mindmap: Optional[str] = None
    created_at: str

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
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        "type": "access"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "refresh"
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def get_fernet():
    key = ENCRYPTION_KEY.encode() if isinstance(ENCRYPTION_KEY, str) else ENCRYPTION_KEY
    # Ensure key is valid Fernet key
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
        raise HTTPException(status_code=401, detail="غير مصرح")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="نوع التوكن غير صالح")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="المستخدم غير موجود")
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "created_at": user["created_at"]
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="انتهت صلاحية التوكن")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="توكن غير صالح")

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register")
async def register(user_data: UserRegister, response: Response):
    email = user_data.email.lower()
    
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="البريد الإلكتروني مستخدم بالفعل")
    
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
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
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
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="بيانات الدخول غير صحيحة")
    
    user_id = str(user["_id"])
    access_token = create_access_token(user_id, email)
    refresh_token = create_refresh_token(user_id)
    
    response.set_cookie(key="access_token", value=access_token, httponly=True, secure=False, samesite="lax", max_age=86400, path="/")
    response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=False, samesite="lax", max_age=604800, path="/")
    
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

# ==================== API KEY ROUTES ====================

@api_router.post("/api-keys")
async def create_api_key(key_data: APIKeyCreate, request: Request):
    user = await get_current_user(request)
    
    # Delete existing key for this user
    await db.api_keys.delete_many({"user_id": user["id"]})
    
    encrypted = encrypt_api_key(key_data.api_key)
    key_doc = {
        "user_id": user["id"],
        "encrypted_key": encrypted,
        "provider": "openrouter",
        "default_model": key_data.default_model,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.api_keys.insert_one(key_doc)
    
    return {
        "id": str(result.inserted_id),
        "provider": "openrouter",
        "default_model": key_data.default_model,
        "created_at": key_doc["created_at"],
        "has_key": True
    }

@api_router.get("/api-keys")
async def get_api_key(request: Request):
    user = await get_current_user(request)
    
    key = await db.api_keys.find_one({"user_id": user["id"]}, {"_id": 1, "provider": 1, "default_model": 1, "created_at": 1})
    
    if not key:
        return {"has_key": False}
    
    return {
        "id": str(key["_id"]),
        "provider": key["provider"],
        "default_model": key["default_model"],
        "created_at": key["created_at"],
        "has_key": True
    }

@api_router.delete("/api-keys")
async def delete_api_key(request: Request):
    user = await get_current_user(request)
    await db.api_keys.delete_many({"user_id": user["id"]})
    return {"message": "تم حذف المفتاح"}

# ==================== PROJECT ROUTES ====================

@api_router.post("/projects")
async def create_project(project_data: ProjectCreate, request: Request):
    user = await get_current_user(request)
    
    # Get user's default model
    api_key = await db.api_keys.find_one({"user_id": user["id"]})
    default_model = api_key["default_model"] if api_key else "openai/gpt-4"
    
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
    
    # Create initial system message
    system_message = {
        "project_id": project_id,
        "role": "assistant",
        "content": """مرحباً! أنا مساعدك الذكي في BuildMap. سأساعدك في تحويل فكرتك إلى مشروع تقني منظم.

لنبدأ بفهم فكرتك بشكل أفضل. سأطرح عليك بعض الأسئلة:

1️⃣ **ما نوع المشروع؟** (تطبيق ويب، تطبيق موبايل، API، نظام متكامل...)
2️⃣ **من هي الفئة المستهدفة؟** (مستخدمين عاديين، شركات، مطورين...)
3️⃣ **ما المشكلة التي يحلها مشروعك؟**

أخبرني المزيد عن فكرتك: """ + project_data.idea,
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
        # Check if has outputs
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
    
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
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
    
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
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
    
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
    await db.projects.delete_one({"_id": ObjectId(project_id)})
    await db.messages.delete_many({"project_id": project_id})
    await db.outputs.delete_many({"project_id": project_id})
    
    return {"message": "تم حذف المشروع"}

# ==================== MESSAGE ROUTES ====================

@api_router.get("/projects/{project_id}/messages")
async def get_messages(project_id: str, request: Request):
    user = await get_current_user(request)
    
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
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
    
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
    # Get user's API key
    api_key_doc = await db.api_keys.find_one({"user_id": user["id"]})
    if not api_key_doc:
        raise HTTPException(status_code=400, detail="يرجى إضافة مفتاح API أولاً")
    
    api_key = decrypt_api_key(api_key_doc["encrypted_key"])
    
    # Save user message
    user_message = {
        "project_id": project_id,
        "role": "user",
        "content": message_data.content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.messages.insert_one(user_message)
    
    # Get conversation history (last 15 messages)
    history = await db.messages.find(
        {"project_id": project_id},
        {"_id": 0, "role": 1, "content": 1}
    ).sort("created_at", -1).limit(15).to_list(15)
    history.reverse()
    
    # Prepare messages for OpenRouter
    system_prompt = """أنت مساعد ذكي في منصة BuildMap. مهمتك هي مساعدة المستخدم في تحويل أفكاره العشوائية إلى مشاريع تقنية منظمة.

قواعد المحادثة:
1. ابدأ بطرح 3 أسئلة أساسية: نوع المشروع، الفئة المستهدفة، المشكلة المراد حلها
2. اطرح أسئلة تدريجية ذكية لفهم الفكرة بشكل أعمق
3. إذا كان هناك غموض، اطلب توضيح
4. لا تربك المستخدم بأسئلة كثيرة دفعة واحدة
5. عندما تشعر أنك فهمت الفكرة بشكل كافٍ، أخبر المستخدم أنك جاهز لتوليد المخرجات

عندما تكون جاهزاً لتوليد المخرجات، أضف في نهاية ردك:
[READY_TO_GENERATE]

تحدث بالعربية دائماً وكن ودوداً ومحترفاً."""

    messages_for_api = [{"role": "system", "content": system_prompt}]
    for msg in history:
        messages_for_api.append({"role": msg["role"], "content": msg["content"]})
    
    # Call OpenRouter API
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://buildmap.app",
                    "X-Title": "BuildMap"
                },
                json={
                    "model": project["selected_model"],
                    "messages": messages_for_api,
                    "max_tokens": 2000,
                    "temperature": 0.7
                }
            )
            
            if response.status_code != 200:
                error_detail = response.text
                logger.error(f"OpenRouter error: {error_detail}")
                raise HTTPException(status_code=500, detail=f"خطأ في الاتصال بالذكاء الاصطناعي: {response.status_code}")
            
            result = response.json()
            assistant_content = result["choices"][0]["message"]["content"]
            
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="انتهت مهلة الاتصال")
    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ: {str(e)}")
    
    # Check if ready to generate
    ready_to_generate = "[READY_TO_GENERATE]" in assistant_content
    clean_content = assistant_content.replace("[READY_TO_GENERATE]", "").strip()
    
    # Save assistant message
    assistant_message = {
        "project_id": project_id,
        "role": "assistant",
        "content": clean_content,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.messages.insert_one(assistant_message)
    
    # Update project timestamp
    await db.projects.update_one(
        {"_id": ObjectId(project_id)},
        {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {
        "id": str(result.inserted_id),
        "role": "assistant",
        "content": clean_content,
        "created_at": assistant_message["created_at"],
        "ready_to_generate": ready_to_generate
    }

# ==================== OUTPUT GENERATION ====================

@api_router.post("/projects/{project_id}/generate")
async def generate_outputs(project_id: str, request: Request):
    user = await get_current_user(request)
    
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
    api_key_doc = await db.api_keys.find_one({"user_id": user["id"]})
    if not api_key_doc:
        raise HTTPException(status_code=400, detail="يرجى إضافة مفتاح API أولاً")
    
    api_key = decrypt_api_key(api_key_doc["encrypted_key"])
    
    # Get conversation summary
    messages = await db.messages.find(
        {"project_id": project_id},
        {"_id": 0, "role": 1, "content": 1}
    ).to_list(100)
    
    conversation_text = "\n".join([f"{m['role']}: {m['content']}" for m in messages])
    
    outputs = {}
    
    # Generate each output type
    output_prompts = {
        "frontend_readme": """بناءً على المحادثة التالية، أنشئ ملف README-Frontend.md يتضمن:
- وصف الواجهة الأمامية
- المكونات الرئيسية
- هيكل الملفات المقترح
- التقنيات المستخدمة
- تعليمات التشغيل

المحادثة:
{conversation}

اكتب الملف بتنسيق Markdown باللغة العربية.""",
        
        "backend_readme": """بناءً على المحادثة التالية، أنشئ ملف README-Backend.md يتضمن:
- وصف الخادم الخلفي
- نقاط النهاية (API Endpoints)
- هيكل قاعدة البيانات
- التقنيات المستخدمة
- تعليمات التشغيل

المحادثة:
{conversation}

اكتب الملف بتنسيق Markdown باللغة العربية.""",
        
        "plan": """بناءً على المحادثة التالية، أنشئ ملف Plan.md يتضمن:
- خطة العمل المرحلية
- المهام المطلوبة
- الأولويات
- الجدول الزمني المقترح
- المخاطر المحتملة

المحادثة:
{conversation}

اكتب الملف بتنسيق Markdown باللغة العربية.""",
        
        "skills": """بناءً على المحادثة التالية، أنشئ ملف Skills.md يتضمن:
- المهارات التقنية المطلوبة
- مستوى الخبرة المطلوب لكل مهارة
- موارد تعليمية مقترحة
- الأدوات والتقنيات

المحادثة:
{conversation}

اكتب الملف بتنسيق Markdown باللغة العربية.""",
        
        "evaluation": """بناءً على المحادثة التالية، قدم تقييم شامل للمشروع يتضمن:
- نقاط القوة
- نقاط الضعف
- الفرص
- التحديات
- توصيات
- تقييم الجدوى (من 10)

المحادثة:
{conversation}

اكتب التقييم باللغة العربية.""",
        
        "mindmap": """بناءً على المحادثة التالية، أنشئ خريطة ذهنية للمشروع بتنسيق JSON:
{
  "title": "اسم المشروع",
  "children": [
    {
      "title": "الفرع الأول",
      "children": [...]
    }
  ]
}

يجب أن تشمل الخريطة:
- الميزات الرئيسية
- المكونات التقنية
- الفئات المستهدفة
- مراحل التنفيذ

المحادثة:
{conversation}

أعد JSON فقط بدون أي نص إضافي."""
    }
    
    async with httpx.AsyncClient(timeout=120.0) as http_client:
        for key, prompt in output_prompts.items():
            try:
                response = await http_client.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                        "HTTP-Referer": "https://buildmap.app",
                        "X-Title": "BuildMap"
                    },
                    json={
                        "model": project["selected_model"],
                        "messages": [
                            {"role": "user", "content": prompt.format(conversation=conversation_text)}
                        ],
                        "max_tokens": 3000,
                        "temperature": 0.5
                    }
                )
                
                if response.status_code == 200:
                    result = response.json()
                    outputs[key] = result["choices"][0]["message"]["content"]
                else:
                    outputs[key] = f"خطأ في التوليد: {response.status_code}"
                    
            except Exception as e:
                logger.error(f"Error generating {key}: {str(e)}")
                outputs[key] = f"خطأ: {str(e)}"
    
    # Save outputs
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
    
    # Upsert output
    await db.outputs.update_one(
        {"project_id": project_id},
        {"$set": output_doc},
        upsert=True
    )
    
    return output_doc

@api_router.get("/projects/{project_id}/outputs")
async def get_outputs(project_id: str, request: Request):
    user = await get_current_user(request)
    
    project = await db.projects.find_one({"_id": ObjectId(project_id), "user_id": user["id"]})
    if not project:
        raise HTTPException(status_code=404, detail="المشروع غير موجود")
    
    output = await db.outputs.find_one({"project_id": project_id}, {"_id": 0})
    
    if not output:
        raise HTTPException(status_code=404, detail="لم يتم توليد المخرجات بعد")
    
    return output

# ==================== AVAILABLE MODELS ====================

@api_router.get("/models")
async def get_available_models():
    return [
        {"id": "openai/gpt-4", "name": "GPT-4", "provider": "OpenAI"},
        {"id": "openai/gpt-4-turbo", "name": "GPT-4 Turbo", "provider": "OpenAI"},
        {"id": "openai/gpt-3.5-turbo", "name": "GPT-3.5 Turbo", "provider": "OpenAI"},
        {"id": "anthropic/claude-3-opus", "name": "Claude 3 Opus", "provider": "Anthropic"},
        {"id": "anthropic/claude-3-sonnet", "name": "Claude 3 Sonnet", "provider": "Anthropic"},
        {"id": "anthropic/claude-3-haiku", "name": "Claude 3 Haiku", "provider": "Anthropic"},
        {"id": "mistralai/mixtral-8x7b-instruct", "name": "Mixtral 8x7B", "provider": "Mistral"},
        {"id": "mistralai/mistral-large", "name": "Mistral Large", "provider": "Mistral"},
        {"id": "google/gemini-pro", "name": "Gemini Pro", "provider": "Google"},
        {"id": "meta-llama/llama-3-70b-instruct", "name": "Llama 3 70B", "provider": "Meta"}
    ]

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "BuildMap API", "version": "1.0.0"}

# Include the router
app.include_router(api_router)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[os.environ.get("FRONTEND_URL", "http://localhost:3000"), "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup
@app.on_event("startup")
async def startup():
    # Create indexes
    await db.users.create_index("email", unique=True)
    await db.api_keys.create_index("user_id")
    await db.projects.create_index("user_id")
    await db.messages.create_index("project_id")
    await db.outputs.create_index("project_id", unique=True)
    logger.info("Database indexes created")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
