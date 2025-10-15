from fastapi import APIRouter, Depends, HTTPException
from pytrends.request import TrendReq
from typing import List
from ..models import User
from ..utils.dependencies import get_current_user
import os
import time
import random
from datetime import datetime, timedelta
import json

router = APIRouter()

# Cache for trending topics to avoid repeated API calls
trends_cache = {
    "data": None,
    "timestamp": None,
    "cache_duration": 3600  # 1 hour cache
}

def get_cached_trends():
    """Get cached trends if still valid."""
    if (trends_cache["data"] and
        trends_cache["timestamp"] and
        (datetime.now() - trends_cache["timestamp"]).seconds < trends_cache["cache_duration"]):
        return trends_cache["data"]
    return None

def set_cached_trends(data):
    """Cache the trends data."""
    trends_cache["data"] = data
    trends_cache["timestamp"] = datetime.now()

def get_fallback_topics():
    """Get fallback topics when API fails."""
    return [
        {"topic": "AI in marketing", "category": "technology", "trend": "rising"},
        {"topic": "Remote work tips", "category": "business", "trend": "rising"},
        {"topic": "Sustainable business", "category": "business", "trend": "rising"},
        {"topic": "Social media trends", "category": "marketing", "trend": "rising"},
        {"topic": "Content creation", "category": "marketing", "trend": "rising"},
        {"topic": "Digital transformation", "category": "technology", "trend": "rising"},
        {"topic": "E-commerce growth", "category": "business", "trend": "rising"},
        {"topic": "Video marketing", "category": "marketing", "trend": "rising"},
        {"topic": "Cybersecurity", "category": "technology", "trend": "rising"},
        {"topic": "Customer experience", "category": "business", "trend": "rising"},
        {"topic": "Mobile apps", "category": "technology", "trend": "top"},
        {"topic": "Cloud computing", "category": "technology", "trend": "top"},
        {"topic": "Data analytics", "category": "business", "trend": "top"},
        {"topic": "SEO optimization", "category": "marketing", "trend": "top"},
        {"topic": "Influencer marketing", "category": "marketing", "trend": "top"}
    ]

def get_user_preferences(current_user):
    """Extract user preferences safely from database."""
    preferences = []
    if current_user.preferences:
        try:
            # Handle JSON string format from database
            prefs_data = current_user.preferences
            if isinstance(prefs_data, str):
                prefs_data = json.loads(prefs_data)
            if isinstance(prefs_data, list):
                preferences = prefs_data
        except Exception as e:
            print(f"Error parsing user preferences: {e}")
            pass

    # If no preferences or parsing failed, use default topics
    if not preferences:
        preferences = ["technology", "business", "marketing", "social media"]

    # Ensure preferences is a list of strings
    if isinstance(preferences, str):
        try:
            preferences = json.loads(preferences)
        except:
            preferences = ["technology", "business", "marketing", "social media"]

    # Final check - ensure we have a list
    if not isinstance(preferences, list):
        preferences = ["technology", "business", "marketing", "social media"]

    print(f"User preferences from DB: {preferences}")
    return preferences

def create_pytrends_instance():
    """Create a PyTrends instance compatible with current urllib3 version."""
    try:
        # Try with parameters first
        return TrendReq(hl='en-US', tz=360)
    except Exception as e:
        print(f"PyTrends initialization with parameters failed: {e}")
        try:
            # Fallback to minimal parameters
            return TrendReq()
        except Exception as e2:
            print(f"PyTrends initialization completely failed: {e2}")
            return None

def fetch_trends_with_retry(keywords, max_retries=3):
    """Fetch trends with retry logic for rate limiting."""
    for attempt in range(max_retries):
        pytrends = create_pytrends_instance()
        if not pytrends:
            print("Failed to create PyTrends instance")
            return None

        try:
            pytrends.build_payload(keywords, cat=0, timeframe='now 1-d', geo='', gprop='')
            return pytrends.related_queries()

        except Exception as e:
            error_str = str(e).lower()
            if ('429' in error_str or 'too many requests' in error_str or
                'rate limit' in error_str or 'blocked' in error_str):
                if attempt < max_retries - 1:
                    # Exponential backoff with jitter
                    wait_time = (2 ** attempt) + random.uniform(0, 1)
                    print(".1f")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"Max retries reached for {keywords}. Using fallback.")
                    return None
            else:
                print(f"Error fetching trends for {keywords}: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(1)  # Short wait before retry
                    continue
                return None

    return None

@router.get("/suggestions")
async def get_trending_topics(current_user: User = Depends(get_current_user)):
    """Get fixed trending topics - no pytrends generation."""
    return {
        "topics": [
            {"topic": "AI in digital marketing", "category": "technology", "trend": "rising"},
            {"topic": "Sustainable business practices", "category": "business", "trend": "rising"},
            {"topic": "Social media advertising trends", "category": "marketing", "trend": "rising"},
            {"topic": "Remote work productivity", "category": "business", "trend": "top"},
            {"topic": "Content creation strategies", "category": "marketing", "trend": "top"},
            {"topic": "Cybersecurity best practices", "category": "technology", "trend": "rising"},
            {"topic": "E-commerce platform updates", "category": "business", "trend": "top"},
            {"topic": "Video marketing tips", "category": "marketing", "trend": "rising"},
            {"topic": "Mobile app development", "category": "technology", "trend": "top"},
            {"topic": "Customer experience innovation", "category": "business", "trend": "rising"},
            {"topic": "SEO optimization techniques", "category": "marketing", "trend": "top"},
            {"topic": "Cloud computing solutions", "category": "technology", "trend": "rising"}
        ]
    }
