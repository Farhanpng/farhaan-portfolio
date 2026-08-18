from dotenv import load_dotenv
load_dotenv()

import os
import re
import uuid
import logging
import requests
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, UploadFile, File, Form
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

JWT_ALGORITHM = "HS256"
APP_NAME = "cinema-portfolio"

STORAGE_BASE = (os.environ.get("INTEGRATION_PROXY_URL") or "").strip() or "https://integrations.emergentagent.com"
STORAGE_URL = STORAGE_BASE.rstrip("/") + "/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
storage_key = None


def init_storage(force: bool = False):
    global storage_key
    if storage_key and not force:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key


def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()


def get_object(path: str):
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")


# ---------- Email (Emergent managed) ----------

import ipaddress
import httpx
from html import escape
from html.parser import HTMLParser
from urllib.parse import urlparse

EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ["EMERGENT_EMAIL_KEY"]
EMAIL_FROM_NAME = os.environ["EMAIL_FROM_NAME"]
EMAIL_REPLY_TO = os.environ.get("EMAIL_REPLY_TO")
OWNER_EMAIL = os.environ.get("OWNER_EMAIL")

_SHORTENERS = ("bit.ly", "tinyurl.com", "t.co", "is.gd", "cutt.ly", "goo.gl", "rebrand.ly")
_CRED_ASK = ("reply with your password", "reply with the code", "send your password", "cvv",
             "send us your password", "enter your password below", "confirm your card number",
             "your full card number", "seed phrase", "recovery phrase", "verify your card",
             "social security number", "confirm your bank details")
_HOSTISH = re.compile(r"\b(?:https?://)?((?:[a-z0-9-]+\.)+[a-z]{2,})", re.I)


def _host_ok(host: str) -> bool:
    if not host or "xn--" in host:
        return False
    try:
        ipaddress.ip_address(host)
        return False
    except ValueError:
        pass
    return not any(host == s or host.endswith("." + s) for s in _SHORTENERS)


def _same_site(shown: str, real: str) -> bool:
    return shown == real or real.endswith("." + shown) or shown.endswith("." + real)


class _EmailScan(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags, self.urls, self.anchors = set(), [], []
        self._href, self._text = None, []
    def handle_starttag(self, tag, attrs):
        self.tags.add(tag.lower())
        self.urls += [v for k, v in attrs if k.lower() in ("href", "src") and v]
        if tag.lower() == "a":
            self._href = dict((k.lower(), v) for k, v in attrs).get("href")
            self._text = []
    def handle_data(self, data):
        if self._href is not None:
            self._text.append(data)
    def handle_endtag(self, tag):
        if tag.lower() == "a" and self._href is not None:
            self.anchors.append((self._href, "".join(self._text)))
            self._href, self._text = None, []


def _assert_safe_email(subject: str, html: str) -> None:
    scan = _EmailScan(); scan.feed(html)
    if scan.tags & {"form", "input", "textarea", "select"}:
        raise ValueError("No forms or input fields in email (G2)")
    body = f"{subject}\n{html}".lower()
    for p in _CRED_ASK:
        if p in body:
            raise ValueError(f"Email asks the recipient for credentials: {p!r} (G2)")
    for url in scan.urls:
        low = url.strip().lower()
        if low.startswith(("mailto:", "tel:", "cid:", "#")):
            continue
        if not low.startswith("https://"):
            raise ValueError(f"Email links/assets must be absolute https: {url!r} (G3)")
        host = urlparse(low).hostname or ""
        if not _host_ok(host) or urlparse(low).username is not None:
            raise ValueError(f"Shortened, numeric-host or credential-bearing URL: {url!r} (G3)")
    for href, text in scan.anchors:
        real = urlparse(href.strip().lower()).hostname or ""
        if not real:
            continue
        for m in _HOSTISH.finditer(text):
            if not _same_site(m.group(1).lower(), real):
                raise ValueError(f"Anchor text {m.group(1)!r} != real link host {real!r} (G3)")


async def send_email(*, to: str, subject: str, html: str, reply_to: str | None = None):
    _assert_safe_email(subject, html)
    payload = {"to": [to], "subject": subject, "html": html, "from_name": EMAIL_FROM_NAME}
    if reply_to or EMAIL_REPLY_TO:
        payload["contact_email"] = reply_to or EMAIL_REPLY_TO
    async with httpx.AsyncClient(timeout=30) as client_http:
        resp = await client_http.post(
            f"{EMAIL_BASE_URL}/api/v1/email/send",
            headers={"X-Email-Key": EMAIL_KEY},
            json=payload,
        )
    resp.raise_for_status()
    return resp.json().get("id")


# ---------- Auth ----------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(email: str) -> str:
    payload = {"sub": email, "exp": datetime.now(timezone.utc) + timedelta(days=7), "type": "access"}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


async def get_current_admin(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    elif request.cookies.get("access_token"):
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"email": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user or user.get("role") != "admin":
        raise HTTPException(status_code=401, detail="Not authorized")
    return user


class LoginRequest(BaseModel):
    email: str
    password: str


@api_router.post("/auth/login")
async def login(body: LoginRequest, request: Request, response: Response):
    email = body.email.lower().strip()
    identifier = f"{request.client.host}:{email}"
    attempts = await db.login_attempts.find_one({"identifier": identifier})
    if attempts and attempts.get("count", 0) >= 5:
        locked_until = attempts.get("locked_until", "")
        if locked_until and datetime.fromisoformat(locked_until) > datetime.now(timezone.utc):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"locked_until": (datetime.now(timezone.utc) + timedelta(minutes=15)).isoformat()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(email)
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True, samesite="lax", max_age=604800, path="/")
    return {"access_token": token, "token_type": "bearer", "user": {"email": email, "name": user.get("name", "Admin"), "role": "admin"}}


@api_router.get("/auth/me")
async def auth_me(admin: dict = Depends(get_current_admin)):
    return admin


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


# ---------- Photos ----------

def serialize_photo(doc: dict) -> dict:
    src = doc.get("url") if doc.get("kind") == "external" else f"/api/files/{doc.get('storage_path')}"
    return {"id": doc["id"], "title": doc.get("title", ""), "category": doc.get("category", ""), "src": src, "kind": doc.get("kind", "upload"), "created_at": doc.get("created_at", "")}


@api_router.get("/photos")
async def list_photos():
    docs = await db.photos.find({"is_deleted": False, "hidden": {"$ne": True}}, {"_id": 0}).sort("created_at", 1).to_list(500)
    return [serialize_photo(d) for d in docs]


@api_router.post("/photos/upload")
async def upload_photo(request: Request, title: str = Form(""), category: str = Form(""), hidden: str = Form(""), file: UploadFile = File(...), admin: dict = Depends(get_current_admin)):
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else "bin"
    if ext not in ("jpg", "jpeg", "png", "webp", "gif"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")
    data = await file.read()
    if len(data) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 20MB)")
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    try:
        result = put_object(path, data, file.content_type or "image/jpeg")
    except Exception as e:
        logger.error(f"Storage upload failed: {e}")
        raise HTTPException(status_code=502, detail="Upload to storage failed")
    doc = {
        "id": str(uuid.uuid4()),
        "title": title or file.filename,
        "category": category or "Uncategorized",
        "kind": "upload",
        "storage_path": result["path"],
        "content_type": file.content_type or "image/jpeg",
        "hidden": hidden.lower() == "true",
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.photos.insert_one(doc)
    return serialize_photo(doc)


@api_router.delete("/photos/{photo_id}")
async def delete_photo(photo_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.photos.update_one({"id": photo_id}, {"$set": {"is_deleted": True}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Photo not found")
    return {"ok": True}


@api_router.get("/files/{path:path}")
async def serve_file(path: str):
    record = await db.photos.find_one({"storage_path": path, "is_deleted": False}, {"_id": 0})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        data, content_type = get_object(path)
    except Exception:
        raise HTTPException(status_code=404, detail="File not found in storage")
    return Response(content=data, media_type=record.get("content_type", content_type), headers={"Cache-Control": "public, max-age=86400"})


# ---------- Videos ----------

def extract_youtube_id(url: str) -> Optional[str]:
    m = re.search(r'(?:youtube\.com/(?:watch\?v=|embed/|shorts/|live/)|youtu\.be/)([\w-]{11})', url or "")
    return m.group(1) if m else None


class VideoCreate(BaseModel):
    title: str
    youtube_url: str
    description: str = ""


def serialize_video(doc: dict) -> dict:
    return {"id": doc["id"], "title": doc.get("title", ""), "youtube_id": doc.get("youtube_id", ""), "description": doc.get("description", ""), "created_at": doc.get("created_at", "")}


@api_router.get("/videos")
async def list_videos():
    docs = await db.videos.find({}, {"_id": 0}).sort("created_at", 1).to_list(200)
    return [serialize_video(d) for d in docs]


@api_router.post("/videos")
async def create_video(body: VideoCreate, admin: dict = Depends(get_current_admin)):
    yt_id = extract_youtube_id(body.youtube_url)
    if not yt_id:
        raise HTTPException(status_code=400, detail="Could not parse a YouTube video ID from that link")
    doc = {"id": str(uuid.uuid4()), "title": body.title, "youtube_id": yt_id, "description": body.description, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.videos.insert_one(doc)
    return serialize_video(doc)


@api_router.delete("/videos/{video_id}")
async def delete_video(video_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.videos.delete_one({"id": video_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"ok": True}


# ---------- Reels (Instagram) ----------

def extract_reel_id(url: str):
    m = re.search(r'instagram\.com/(?:reel|reels|p)/([\w-]+)', url or "")
    return m.group(1) if m else None


class ReelCreate(BaseModel):
    title: str
    instagram_url: str


def serialize_reel(doc: dict) -> dict:
    return {"id": doc["id"], "title": doc.get("title", ""), "reel_id": doc.get("reel_id", ""), "cover": doc.get("cover", ""), "created_at": doc.get("created_at", "")}


@api_router.get("/reels")
async def list_reels():
    docs = await db.reels.find({}, {"_id": 0}).sort("created_at", 1).to_list(100)
    return [serialize_reel(d) for d in docs]


@api_router.post("/reels")
async def create_reel(body: ReelCreate, admin: dict = Depends(get_current_admin)):
    reel_id = extract_reel_id(body.instagram_url)
    if not reel_id:
        raise HTTPException(status_code=400, detail="Could not parse an Instagram reel ID from that link")
    doc = {"id": str(uuid.uuid4()), "title": body.title, "reel_id": reel_id, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.reels.insert_one(doc)
    return serialize_reel(doc)


@api_router.delete("/reels/{reel_doc_id}")
async def delete_reel(reel_doc_id: str, admin: dict = Depends(get_current_admin)):
    res = await db.reels.delete_one({"id": reel_doc_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Reel not found")
    return {"ok": True}


# ---------- Contact messages ----------

class ContactMessage(BaseModel):
    name: str
    email: str
    message: str


@api_router.post("/contact")
async def create_message(body: ContactMessage):
    doc = {"id": str(uuid.uuid4()), "name": body.name, "email": body.email, "message": body.message, "created_at": datetime.now(timezone.utc).isoformat()}
    await db.messages.insert_one(doc)
    if OWNER_EMAIL and EMAIL_KEY:
        try:
            subject = f"New enquiry from {body.name.replace(chr(10), ' ').strip()} — portfolio"
            html = (
                '<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif;color:#111">'
                f'<h2 style="margin:0 0 16px">New portfolio enquiry</h2>'
                f'<p style="margin:0 0 8px"><strong>Name:</strong> {escape(body.name)}</p>'
                f'<p style="margin:0 0 8px"><strong>Email:</strong> <a href="mailto:{escape(body.email)}">{escape(body.email)}</a></p>'
                f'<p style="margin:16px 0 4px"><strong>Message:</strong></p>'
                f'<p style="margin:0;white-space:pre-wrap">{escape(body.message)}</p>'
                f'<p style="font-size:12px;color:#888;margin-top:24px">Sent by {escape(EMAIL_FROM_NAME)} — the contact form on your portfolio website.</p>'
                '</td></tr></table>'
            )
            email_id = await send_email(to=OWNER_EMAIL, subject=subject, html=html)
            logger.info(f"Enquiry email sent: {email_id}")
        except Exception as e:
            logger.error(f"Enquiry email failed: {e}")
    return {"ok": True}


@api_router.get("/messages")
async def list_messages(admin: dict = Depends(get_current_admin)):
    return await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.get("/")
async def root():
    return {"message": "Cinema Portfolio API"}


# ---------- Startup seeding ----------

SEED_PHOTOS = [
    {"title": "Shadow Play", "category": "Portrait", "url": "https://images.pexels.com/photos/29433729/pexels-photo-29433729.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"title": "Berlin Nights", "category": "Street", "url": "https://images.pexels.com/photos/11290329/pexels-photo-11290329.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"title": "Coastal Silence", "category": "Landscape", "url": "https://images.unsplash.com/photo-1461301214746-1e109215d6d3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBsYW5kc2NhcGUlMjBwaG90b2dyYXBoeXxlbnwwfHx8fDE3ODcwMzM4NTl8MA&ixlib=rb-4.1.0&q=85"},
    {"title": "The Gaze", "category": "Portrait", "url": "https://images.pexels.com/photos/34742151/pexels-photo-34742151.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"},
    {"title": "Aerial Dark", "category": "Landscape", "url": "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODd8MHwxfHNlYXJjaHwzfHxjaW5lbWF0aWMlMjBsYW5kc2NhcGUlMjBwaG90b2dyYXBoeXxlbnwwfHx8fDE3ODcwMzM4NTl8MA&ixlib=rb-4.1.0&q=85"},
    {"title": "Close Up", "category": "Portrait", "url": "https://images.unsplash.com/photo-1568038479111-87bf80659645?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwbW9vZHklMjBjaW5lbWF0b2dyYXBoeSUyMHBvcnRyYWl0fGVufDB8fHx8MTc4NzAzMzg1OXww&ixlib=rb-4.1.0&q=85"},
]

SEED_VIDEOS = [
    {"title": "Showreel", "youtube_url": "https://www.youtube.com/watch?v=aqz-KE-bpKQ", "description": "Placeholder showreel — replace it with your own film from the admin panel."},
]


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@example.com").lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "admin123")
    existing = await db.users.find_one({"email": admin_email})
    if existing is None:
        await db.users.insert_one({"email": admin_email, "password_hash": hash_password(admin_password), "name": "Admin", "role": "admin", "created_at": datetime.now(timezone.utc).isoformat()})
        logger.info("Admin user seeded")
    elif not verify_password(admin_password, existing["password_hash"]):
        await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
        logger.info("Admin password updated from env")
    if await db.photos.count_documents({}) == 0:
        await db.photos.insert_many([
            {"id": str(uuid.uuid4()), "title": p["title"], "category": p["category"], "kind": "external", "url": p["url"], "is_deleted": False, "created_at": datetime.now(timezone.utc).isoformat()}
            for p in SEED_PHOTOS
        ])
        logger.info("Seed photos inserted")
    if await db.videos.count_documents({}) == 0:
        await db.videos.insert_many([
            {"id": str(uuid.uuid4()), "title": v["title"], "youtube_id": extract_youtube_id(v["youtube_url"]), "description": v["description"], "created_at": datetime.now(timezone.utc).isoformat()}
            for v in SEED_VIDEOS
        ])
        logger.info("Seed videos inserted")
    try:
        init_storage()
        logger.info("Object storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
