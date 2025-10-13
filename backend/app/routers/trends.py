from fastapi import APIRouter, Depends, HTTPException
from pytrends.request import TrendReq
from typing import List
from ..models import User
from ..utils.dependencies import get_current_user
import os

router = APIRouter()

@router.get("/suggestions")
async def get_trending_topics(current_user: User = Depends(get_current_user)):
    """Get trending topics based on user preferences."""
    try:
        # Initialize pytrends
        pytrends = TrendReq(hl='en-US', tz=360)

        # Get user preferences
        preferences = []
        if current_user.preferences:
            try:
                # Handle both string and list formats
                prefs_data = current_user.preferences
                if isinstance(prefs_data, str):
                    prefs_data = eval(prefs_data)
                if isinstance(prefs_data, list):
                    preferences = prefs_data
            except:
                pass

        # If no preferences, use default topics
        if not preferences:
            preferences = ["technology", "business", "marketing", "social media"]

        # Ensure preferences is a list of strings
        if isinstance(preferences, str):
            try:
                preferences = eval(preferences)
            except:
                preferences = ["technology", "business", "marketing", "social media"]

        # Final check - ensure we have a list
        if not isinstance(preferences, list):
            preferences = ["technology", "business", "marketing", "social media"]

        trending_topics = []

        # Get trending topics for each preference
        for pref in preferences[:3]:  # Limit to 3 preferences
            try:
                pytrends.build_payload([pref], cat=0, timeframe='now 1-d', geo='', gprop='')
                related_queries = pytrends.related_queries()
                rising_queries = pytrends.related_queries()[pref]['rising']

                if rising_queries is not None:
                    # Get top 5 trending queries for this preference
                    for _, row in rising_queries.head(5).iterrows():
                        topic = row['query']
                        if topic and len(topic) > 3:  # Filter out short queries
                            trending_topics.append({
                                "topic": topic,
                                "category": pref,
                                "trend": "rising"
                            })

                # Also add top queries
                top_queries = pytrends.related_queries()[pref]['top']
                if top_queries is not None:
                    for _, row in top_queries.head(3).iterrows():
                        topic = row['query']
                        if topic and len(topic) > 3:
                            trending_topics.append({
                                "topic": topic,
                                "category": pref,
                                "trend": "top"
                            })

            except Exception as e:
                print(f"Error fetching trends for {pref}: {str(e)}")
                continue

        # Remove duplicates and limit to top 20
        seen_topics = set()
        unique_topics = []
        for topic in trending_topics:
            topic_key = topic['topic'].lower()
            if topic_key not in seen_topics:
                seen_topics.add(topic_key)
                unique_topics.append(topic)

        return {"topics": unique_topics[:20]}

    except Exception as e:
        print(f"Google Trends API error: {str(e)}")
        # Return default topics if API fails
        default_topics = [
            {"topic": "AI in marketing", "category": "technology", "trend": "rising"},
            {"topic": "Remote work tips", "category": "business", "trend": "rising"},
            {"topic": "Sustainable business", "category": "business", "trend": "rising"},
            {"topic": "Social media trends", "category": "marketing", "trend": "rising"},
            {"topic": "Content creation", "category": "marketing", "trend": "rising"}
        ]
        return {"topics": default_topics}
