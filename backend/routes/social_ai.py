"""Social AI Router.

Handles text-to-image (cover art) and text-to-video (short clip promos) generation prompts,
format recommendations, AI captions, and YouTube API integrations.
"""
import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from bson import ObjectId

import os
import io
import time
import urllib.parse
import urllib.request
from PIL import Image, ImageFilter, ImageEnhance
from utils import get_current_user, get_optional_user
from config import db
from pydantic import ConfigDict
from datetime import datetime, timezone

class GeneratedAsset(BaseModel):
    id: Optional[str] = Field(default=None, alias="_id")
    user_id: str
    media_type: str
    media_url: str
    prompt: str
    aspect_ratio: Optional[str] = "1:1"
    duration_seconds: Optional[int] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    def to_mongo(self) -> dict:
        data = self.model_dump(by_alias=True, exclude_none=True)
        if data.get("_id") is None:
            data.pop("_id", None)
        return data

class AssetUpdateRequest(BaseModel):
    prompt: str
from services.youtube_service import youtube_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/social-ai", tags=["social-ai"])

RETINA_DIMENSIONS = {
    "16:9": (2560, 1440),
    "3:1": (2560, 854),
    "banner": (2560, 854),
    "header": (2560, 854),
    "1:1": (2048, 2048),
    "4:5": (1600, 2000),
    "portrait": (1600, 2000),
    "9:16": (1440, 2560),
}


class ArtGenerateRequest(BaseModel):
    prompt: str
    aspect_ratio: Optional[str] = "16:9"


class VideoGenerateRequest(BaseModel):
    prompt: str
    duration_seconds: Optional[int] = 5


@router.post("/generate-art")
def generate_art(payload: ArtGenerateRequest, current_user: Optional[dict] = Depends(get_optional_user)):
    """Creative text-to-image artwork generation responding to user prompts with Retina-ready crispness."""
    raw_prompt = payload.prompt.strip()
    if not raw_prompt:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty"
        )
    
    aspect_ratio = payload.aspect_ratio or "16:9"
    target_w, target_h = RETINA_DIMENSIONS.get(aspect_ratio, (2560, 1440))
    
    # Enrich prompt with professional photography & high-fidelity tokens for crisp realism
    enriched_prompt = f"{raw_prompt}, photorealistic, 8k ultra detailed, crisp focus, studio lighting, masterpiece"
    clean_prompt = urllib.parse.quote(enriched_prompt)
    
    seed = int(time.time() * 1000) % 10000000
    generator_url = f"https://image.pollinations.ai/prompt/{clean_prompt}?width={target_w}&height={target_h}&nologo=true&seed={seed}"
    
    media_url = generator_url
    
    # Retina Enhancement Pipeline: Download, Lanczos upscale to true Retina 2K, and apply unsharp mask
    try:
        req = urllib.request.Request(
            generator_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        )
        with urllib.request.urlopen(req, timeout=14) as resp:
            data = resp.read()
            if data and len(data) > 2048:
                img = Image.open(io.BytesIO(data))
                # Ensure true Retina dimensions with Lanczos resampling
                if img.size != (target_w, target_h):
                    img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
                
                # Apply crisp micro-contrast and unsharp masking for Retina screens
                enhancer = ImageEnhance.Sharpness(img)
                crisp = enhancer.enhance(1.20)
                crisp = crisp.filter(ImageFilter.UnsharpMask(radius=1.6, percent=120, threshold=2))
                
                # Save locally to static uploads directory
                uploads_dir = os.environ.get("LOCAL_UPLOADS_DIR", "uploads")
                ai_dir = os.path.join(uploads_dir, "ai_assets")
                os.makedirs(ai_dir, exist_ok=True)
                
                filename = f"retina_art_{seed}_{target_w}x{target_h}.jpg"
                filepath = os.path.join(ai_dir, filename)
                crisp.save(filepath, format="JPEG", quality=95, optimize=True, dpi=(96, 96))
                
                media_url = f"/uploads/ai_assets/{filename}"
                logger.info(f"Generated 96 DPI Retina-ready crisp artwork ({target_w}x{target_h}) saved to {media_url}")
    except Exception as exc:
        logger.warning(f"Retina local upscaling fallback (serving upstream URL): {exc}")
    
    user_id = str(current_user["_id"]) if current_user else "anonymous_cms"
    subdomain = current_user.get("brand_name") or current_user.get("name") or "ndufo" if current_user else "ndufo"
    
    asset = GeneratedAsset(
        user_id=user_id,
        media_type="image",
        media_url=media_url,
        prompt=payload.prompt,
        aspect_ratio=payload.aspect_ratio
    )
    
    asset_doc = asset.to_mongo()
    asset_doc["subdomain"] = str(subdomain).lower()
    asset_doc["title"] = f"AI Artwork: {payload.prompt[:32]}"
    asset_doc["filename"] = filename if 'filename' in locals() else f"ai_{seed}.jpg"
    asset_doc["content_type"] = "image/jpeg"
    asset_doc["is_ai"] = True
    asset_doc["dpi"] = 96
    
    try:
        result = db.assets.insert_one(asset_doc)
        asset_doc["id"] = str(result.inserted_id)
        asset_doc.pop("_id", None)
    except Exception:
        asset_doc["id"] = str(seed)
        asset_doc.pop("_id", None)
    
    return {
        "status": "success",
        "asset": asset_doc
    }


@router.post("/generate-video")
def generate_video(payload: VideoGenerateRequest, current_user: dict = Depends(get_current_user)):
    """Simulate text-to-video promotional teaser clip generation and save it to the asset manager."""
    if not payload.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty"
        )
    
    mock_video_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
    
    asset = GeneratedAsset(
        user_id=str(current_user["_id"]),
        media_type="video",
        media_url=mock_video_url,
        prompt=payload.prompt,
        duration_seconds=payload.duration_seconds
    )
    
    asset_doc = asset.to_mongo()
    result = db.assets.insert_one(asset_doc)
    asset_doc["id"] = str(result.inserted_id)
    asset_doc.pop("_id", None)
    
    return {
        "status": "success",
        "asset": asset_doc
    }


@router.get("/assets")
def list_assets(current_user: dict = Depends(get_current_user)):
    """List all previously generated assets for the current user."""
    cursor = db.assets.find({"user_id": str(current_user["_id"])}).sort("created_at", -1)
    assets = []
    for doc in cursor:
        doc["id"] = str(doc["_id"])
        doc.pop("_id", None)
        assets.append(doc)
    return assets


@router.put("/assets/{asset_id}")
def update_asset(asset_id: str, payload: AssetUpdateRequest, current_user: dict = Depends(get_current_user)):
    """Update metadata (like prompt caption) of a previously generated asset."""
    if not payload.prompt.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prompt cannot be empty"
        )
    
    res = db.assets.update_one(
        {"_id": ObjectId(asset_id), "user_id": str(current_user["_id"])},
        {"$set": {"prompt": payload.prompt}}
    )
    
    if res.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
        
    updated = db.assets.find_one({"_id": ObjectId(asset_id)})
    updated["id"] = str(updated["_id"])
    updated.pop("_id", None)
    return updated


@router.delete("/assets/{asset_id}")
def delete_asset(asset_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a previously generated asset."""
    res = db.assets.delete_one({"_id": ObjectId(asset_id), "user_id": str(current_user["_id"])})
    if res.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Asset not found")
    return {"status": "success", "message": "Asset deleted"}


class RecommendationRequest(BaseModel):
    platform: str  # 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'linkedin'
    content_type: Optional[str] = "music_video"


@router.post("/recommendations")
def get_channel_recommendations(payload: RecommendationRequest):
    """Provides path-based format, aspect ratio, and prompt recommendations per social platform."""
    plat = payload.platform.lower()
    
    aspect_ratio_map = {
        "instagram": "9:16",
        "tiktok": "9:16",
        "youtube": "16:9",
        "youtube_shorts": "9:16",
        "facebook": "1:1",
        "linkedin": "1:1",
    }
    
    recommended_ratio = aspect_ratio_map.get(plat, "9:16" if "short" in plat or plat in ("tiktok", "instagram") else "16:9")
    
    hashtags_map = {
        "instagram": ["#TuneMavens", "#NewMusic", "#ReelsViral", "#SyncLicensing", "#MusicProducer"],
        "tiktok": ["#fyp", "#MusicTok", "#IndieArtist", "#TuneStream", "#ViralSound"],
        "youtube": ["#TuneMavens", "#OfficialMusicVideo", "#4KAudio", "#SyncMavens"],
        "facebook": ["#IntermavenNetwork", "#MusicCatalog", "#TuneMavens"],
        "linkedin": ["#MusicBusiness", "#SyncLicensing", "#EntertainmentIndustry"],
    }
    
    return {
        "platform": plat,
        "content_type": payload.content_type,
        "recommended_aspect_ratio": recommended_ratio,
        "prompt_formula": f"Cinematic {payload.content_type} teaser, cyber neon lighting, 8k resolution, formatted for {plat} [{recommended_ratio}]",
        "recommended_hashtags": hashtags_map.get(plat, ["#TuneMavens", "#IntermavenNetwork"]),
        "optimal_posting_times": ["12:00 PM EST", "6:00 PM EST", "9:00 PM EST"],
    }


class CaptionGenerateRequest(BaseModel):
    track_title: str
    artist: str
    mood: Optional[str] = "energetic"
    platform: Optional[str] = "instagram"


@router.post("/generate-caption")
def generate_caption(payload: CaptionGenerateRequest):
    """Generates promotional social media copy and hashtags."""
    caption = (
        f"ðŸ”¥ Out Now! Check out '{payload.track_title}' by {payload.artist}! "
        f"Vibe: {payload.mood.capitalize()}. Stream the full loss-less track on TuneStream ðŸŽ§ "
        f"For sync licensing inquiries, pitch on SyncMavens. Link in bio! ðŸš€"
    )
    return {
        "track_title": payload.track_title,
        "artist": payload.artist,
        "platform": payload.platform,
        "generated_caption": caption,
        "hashtags": ["#TuneMavens", "#TuneStream", "#SyncMavens", f"#{payload.artist.replace(' ', '')}"],
    }


@router.get("/youtube/channel/{channel_id}")
def get_youtube_channel(channel_id: str):
    """Fetches YouTube channel statistics and subscriber count via YouTube Data API v3."""
    return youtube_service.get_channel_metrics(channel_id)


@router.get("/youtube/featured")
def get_youtube_featured():
    """Fetches featured creator video showcases for Wall of Fame profiles."""
    return {"showcase": youtube_service.get_featured_showcase()}


@router.get("/video-stats")
@router.get("/youtube/stats")
def get_video_statistics(url: Optional[str] = None, video_id: Optional[str] = None):
    """Fetches live real-time YouTube video view counts and metadata directly from the hosting platform."""
    target = url or video_id
    if not target:
        raise HTTPException(status_code=400, detail="Either 'url' or 'video_id' parameter is required.")
    return youtube_service.get_video_stats(target)


# â”€â”€ AI Prompt Styles Management (Admin & CMS Overview) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

DEFAULT_AI_STYLES = [
    {
        "id": "none",
        "label": "None / Custom Prompt Style",
        "desc": "Use prompt as typed without extra styling modifiers",
        "prompt_suffix": "",
        "is_default": True
    },
    {
        "id": "afro_futurism",
        "label": "Afro-Futurism",
        "desc": "Cosmic African cyber-tribal aesthetics, golden accents, luminescent patterns",
        "prompt_suffix": "cosmic Afro-futurist aesthetic, glowing African fractal patterns, warm metallic gold and neon accents, 8k masterpiece",
        "is_default": True
    },
    {
        "id": "retro_synth",
        "label": "Retro 80s Synthwave",
        "desc": "Chrome grid, neon magenta & cyan lasers, nostalgic VHS analog glow",
        "prompt_suffix": "retro synthwave aesthetic, 1980s neon grid horizon, cyan and magenta lasers, analog VHS warmth, chrome reflections",
        "is_default": True
    },
    {
        "id": "modern_editorial",
        "label": "Modern Editorial",
        "desc": "Clean high-fashion minimalism, architectural studio lighting, crisp contrast",
        "prompt_suffix": "clean high-fashion editorial, architectural studio lighting, minimalist composition, crisp contrast, 8k crisp details",
        "is_default": True
    },
    {
        "id": "cyberpunk",
        "label": "Cyberpunk Neon",
        "desc": "Dark futuristic megacity, rain reflections, glowing holographic signage",
        "prompt_suffix": "dark cyberpunk megacity, neon holographic reflections, rain-slicked asphalt, dramatic volumetric fog",
        "is_default": True
    },
    {
        "id": "cartoon_anime",
        "label": "Cartoon / Anime",
        "desc": "Vibrant comic cel-shading, dynamic bold linework, stylized character art",
        "prompt_suffix": "vibrant Japanese anime illustration, dynamic cel-shading, expressive linework, saturated color palette",
        "is_default": True
    },
    {
        "id": "octane_3d",
        "label": "3D Render / Octane",
        "desc": "Hyper-detailed 3D modeling, volumetric ray-tracing, glossy metallic surfaces",
        "prompt_suffix": "Octane render 3D masterpiece, ray-traced ambient occlusion, glossy iridescent materials, depth of field",
        "is_default": True
    },
    {
        "id": "oil_painting",
        "label": "Oil Painting / Impressionist",
        "desc": "Rich impasto textures, expressive artistic palette knife and canvas brushwork",
        "prompt_suffix": "traditional textured oil painting on linen canvas, impasto palette knife strokes, expressive fine art masterpiece",
        "is_default": True
    },
    {
        "id": "studio_photo",
        "label": "Studio Photography",
        "desc": "8k ultra-sharp DSLR portrait, shallow depth of field, softbox rim lighting",
        "prompt_suffix": "Hasselblad medium format studio photograph, 8k ultra-sharp portrait, shallow depth of field, softbox rim lighting",
        "is_default": True
    }
]


class AiStyleModel(BaseModel):
    id: Optional[str] = None
    label: str
    desc: str
    prompt_suffix: Optional[str] = ""
    is_default: Optional[bool] = False


@router.get("/styles")
def get_ai_styles():
    """Retrieve all available AI image styles from MongoDB db.ai_styles."""
    try:
        for s in DEFAULT_AI_STYLES:
            db.ai_styles.update_one({"id": s["id"]}, {"$setOnInsert": s}, upsert=True)
        styles = list(db.ai_styles.find({}, {"_id": 0}))
        return {"status": "success", "styles": styles}
    except Exception as e:
        logger.warning(f"Failed to query ai_styles from DB, returning defaults: {e}")
        return {"status": "fallback", "styles": DEFAULT_AI_STYLES}


@router.post("/styles")
def create_ai_style(payload: AiStyleModel, current_user: Optional[dict] = Depends(get_optional_user)):
    """Admin / Creator endpoint to create a new AI prompt style."""
    clean_label = payload.label.strip()
    if not clean_label:
        raise HTTPException(status_code=400, detail="Style label cannot be empty.")
    
    style_id = (payload.id or clean_label.lower().replace(" ", "_").replace("-", "_")).strip()
    doc = {
        "id": style_id,
        "label": clean_label,
        "desc": payload.desc.strip(),
        "prompt_suffix": (payload.prompt_suffix or "").strip(),
        "is_default": False,
        "created_at": time.time(),
        "updated_at": time.time()
    }
    try:
        db.ai_styles.update_one({"id": style_id}, {"$set": doc}, upsert=True)
        return {"status": "success", "style": doc, "message": f"Style '{clean_label}' saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error saving style: {e}")


@router.put("/styles/{style_id}")
def update_ai_style(style_id: str, payload: AiStyleModel, current_user: Optional[dict] = Depends(get_optional_user)):
    """Admin / Creator endpoint to edit an existing AI prompt style."""
    clean_id = style_id.strip()
    existing = db.ai_styles.find_one({"id": clean_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Style not found.")
    
    updates = {
        "label": payload.label.strip(),
        "desc": payload.desc.strip(),
        "prompt_suffix": (payload.prompt_suffix or "").strip(),
        "updated_at": time.time()
    }
    db.ai_styles.update_one({"id": clean_id}, {"$set": updates})
    updated_doc = {**existing, **updates}
    if "_id" in updated_doc:
        del updated_doc["_id"]
    return {"status": "success", "style": updated_doc, "message": f"Style '{clean_id}' updated successfully."}


@router.delete("/styles/{style_id}")
def delete_ai_style(style_id: str, current_user: Optional[dict] = Depends(get_optional_user)):
    """Admin / Creator endpoint to remove a custom AI style."""
    clean_id = style_id.strip()
    if clean_id == "none":
        raise HTTPException(status_code=400, detail="Cannot delete default 'none' style.")
    res = db.ai_styles.delete_one({"id": clean_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Style not found.")
    return {"status": "success", "message": f"Style '{clean_id}' deleted."}




# ============== CONTENT CALENDAR / SCHEDULED POSTS ==============

class ScheduledPostCreate(BaseModel):
    platform: str
    format: Optional[str] = "feed_post"
    title: str
    caption: str
    scheduled_for: str
    persona: Optional[str] = "creator"

@router.get("/scheduled")
async def list_scheduled_posts(current_user: dict = Depends(get_current_user)):
    if db is None:
        return {"posts": []}
    posts = list(db.social_scheduled_posts.find({"user_id": str(current_user["_id"])}).sort("scheduled_for", 1).limit(50))
    for p in posts:
        p["id"] = str(p.pop("_id"))
        if isinstance(p.get("created_at"), datetime):
            p["created_at"] = p["created_at"].isoformat()
    return {"posts": posts}

@router.post("/scheduled")
async def create_scheduled_post(req: ScheduledPostCreate, current_user: dict = Depends(get_current_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")
    doc = {
        "user_id": str(current_user["_id"]),
        "platform": req.platform,
        "format": req.format,
        "title": req.title,
        "caption": req.caption,
        "scheduled_for": req.scheduled_for,
        "persona": req.persona or current_user.get("persona", "creator"),
        "status": "scheduled",
        "created_at": datetime.now(timezone.utc),
    }
    res = db.social_scheduled_posts.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    doc["created_at"] = doc["created_at"].isoformat()
    return {"success": True, "post": doc}

@router.delete("/scheduled/{post_id}")
async def delete_scheduled_post(post_id: str, current_user: dict = Depends(get_current_user)):
    if db is None:
        return {"success": True}
    try:
        db.social_scheduled_posts.delete_one({"_id": ObjectId(post_id), "user_id": str(current_user["_id"])})
    except Exception:
        pass
    return {"success": True}
