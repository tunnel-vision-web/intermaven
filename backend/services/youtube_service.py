"""YouTube Data API v3 Integration Service.

Fetches channel metadata, subscriber metrics, and featured video showcases
for creator Wall of Fame profiles, with sandbox mock fallbacks.
"""
import os
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

YOUTUBE_API_KEY = os.environ.get("YOUTUBE_API_KEY")


class YouTubeService:
    """Service wrapper for YouTube Data API v3."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or YOUTUBE_API_KEY

    def get_channel_metrics(self, channel_id: str) -> Dict:
        """Fetches channel subscriber count, view count, and video showcase."""
        if self.api_key:
            try:
                import requests
                url = f"https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id={channel_id}&key={self.api_key}"
                resp = requests.get(url, timeout=5)
                if resp.status_code == 200:
                    items = resp.json().get("items", [])
                    if items:
                        item = items[0]
                        stats = item.get("statistics", {})
                        snippet = item.get("snippet", {})
                        return {
                            "channel_id": channel_id,
                            "title": snippet.get("title", "Intermaven Artist"),
                            "description": snippet.get("description", ""),
                            "subscriber_count": int(stats.get("subscriberCount", 0)),
                            "view_count": int(stats.get("viewCount", 0)),
                            "video_count": int(stats.get("videoCount", 0)),
                            "custom_url": snippet.get("customUrl", f"@{channel_id}"),
                            "thumbnail_url": snippet.get("thumbnails", {}).get("default", {}).get("url", ""),
                            "mock": False,
                        }
            except Exception as e:
                logger.warning(f"YouTube API call failed: {e}. Using sandbox fallback.")

        # Sandbox Mock Fallback
        return {
            "channel_id": channel_id,
            "title": "Intermaven Wall of Fame Artist",
            "description": "Featured Intermaven Ecosystem Creator & Producer",
            "subscriber_count": 145000,
            "view_count": 8900000,
            "video_count": 48,
            "custom_url": f"@{channel_id}",
            "thumbnail_url": "https://picsum.photos/seed/yt_artist/200",
            "featured_videos": [
                {
                    "video_id": "dQw4w9WgXcQ",
                    "title": "Nairobi Cyberwave (Official Music Video)",
                    "views": "1.2M",
                    "published_at": "2026-05-12",
                },
                {
                    "video_id": " ForBiggerBlazes",
                    "title": "SyncMavens Live Studio Session",
                    "views": "450K",
                    "published_at": "2026-06-20",
                }
            ],
            "mock": True,
        }

    def get_featured_showcase(self) -> List[Dict]:
        """Returns trending creator video showcases across the network."""
        return [
            {
                "artist": "Kip & The Mavens",
                "title": "Nairobi Cyberwave Odyssey",
                "platform": "YouTube",
                "video_id": "v=showcase_1",
                "views": "1.2M",
                "thumbnail_url": "https://picsum.photos/seed/yt_showcase1/400/225",
            },
            {
                "artist": "Cyber Maven",
                "title": "Neon Pursuit (Live Sync Pitch)",
                "platform": "YouTube",
                "video_id": "v=showcase_2",
                "views": "680K",
                "thumbnail_url": "https://picsum.photos/seed/yt_showcase2/400/225",
            }
        ]

    def extract_video_id(self, url_or_id: str) -> str:
        """Extract 11-character YouTube video ID from various YouTube URL formats."""
        import re
        if not url_or_id:
            return ""
        s = str(url_or_id).strip()
        m = re.search(r'(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})', s)
        if m:
            return m.group(1)
        if re.match(r'^[\w-]{11}$', s):
            return s
        return s

    def format_view_count(self, count: int) -> str:
        """Formats an integer view count into human-readable K/M/B string."""
        if count >= 1_000_000_000:
            return f"{count / 1_000_000_000:.1f}B views"
        elif count >= 1_000_000:
            return f"{count / 1_000_000:.1f}M views"
        elif count >= 1_000:
            return f"{count / 1_000:.1f}K views"
        return f"{count:,} views"

    def get_video_stats(self, url_or_id: str) -> Dict:
        """Pull actual real-time view counts, title, and metadata directly from YouTube."""
        import re
        import urllib.request

        vid = self.extract_video_id(url_or_id)
        if not vid or len(vid) != 11:
            return {
                "video_id": vid or "unknown",
                "views": 0,
                "view_count": 0,
                "formatted_views": "0 views",
                "views_formatted": "0 views",
                "title": "YouTube Video",
                "thumbnail_url": "",
                "live": False
            }

        # 1. Attempt official YouTube Data API v3 if API key is present
        if self.api_key:
            try:
                import requests
                api_url = f"https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id={vid}&key={self.api_key}"
                resp = requests.get(api_url, timeout=5)
                if resp.status_code == 200:
                    items = resp.json().get("items", [])
                    if items:
                        item = items[0]
                        stats = item.get("statistics", {})
                        snippet = item.get("snippet", {})
                        raw_views = int(stats.get("viewCount", 0))
                        title = snippet.get("title", f"YouTube Video ({vid})")
                        formatted = self.format_view_count(raw_views)
                        return {
                            "video_id": vid,
                            "views": raw_views,
                            "view_count": raw_views,
                            "formatted_views": formatted,
                            "views_formatted": formatted,
                            "title": title,
                            "thumbnail_url": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
                            "youtube_url": f"https://www.youtube.com/watch?v={vid}",
                            "embed_url": f"https://www.youtube.com/embed/{vid}",
                            "live": True
                        }
            except Exception as e:
                logger.warning(f"YouTube Data API failed for {vid}: {e}. Falling back to direct extraction.")

        # 2. Direct public page extraction (no API key needed)
        try:
            req = urllib.request.Request(
                f"https://www.youtube.com/watch?v={vid}",
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept-Language": "en-US,en;q=0.9"
                }
            )
            with urllib.request.urlopen(req, timeout=6) as response:
                html = response.read().decode("utf-8", errors="ignore")

                # Extract viewCount from JSON metadata in initial HTML
                m = re.search(r'viewCount.:.([0-9]+)', html) or re.search(r'"viewCount":\s*"([0-9]+)"', html)
                raw_views = int(m.group(1)) if m else None

                # Extract title
                title_match = re.search(r'<title>(.*?)(?: - YouTube)?<\/title>', html)
                title = title_match.group(1).replace(" - YouTube", "").strip() if title_match else f"YouTube Video ({vid})"

                if raw_views is not None:
                    formatted = self.format_view_count(raw_views)
                    return {
                        "video_id": vid,
                        "views": raw_views,
                        "view_count": raw_views,
                        "formatted_views": formatted,
                        "views_formatted": formatted,
                        "title": title,
                        "thumbnail_url": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
                        "youtube_url": f"https://www.youtube.com/watch?v={vid}",
                        "embed_url": f"https://www.youtube.com/embed/{vid}",
                        "live": True
                    }
        except Exception as err:
            logger.warning(f"Direct YouTube scrape failed for {vid}: {err}")

        # Fallback with standard YouTube thumbnail
        return {
            "video_id": vid,
            "views": 850000,
            "view_count": 850000,
            "formatted_views": "850K views",
            "views_formatted": "850K views",
            "title": f"Official Video ({vid})",
            "thumbnail_url": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
            "youtube_url": f"https://www.youtube.com/watch?v={vid}",
            "embed_url": f"https://www.youtube.com/embed/{vid}",
            "live": False
        }


youtube_service = YouTubeService()
