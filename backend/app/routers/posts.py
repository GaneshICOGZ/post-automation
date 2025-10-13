from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..schemas.post import (
    PostSummaryCreate, PostSummaryResponse, PostSummaryUpdate,
    PostPlatformCreate, PostPlatformResponse, PostPlatformUpdate,
    PostWithPlatformsResponse
)
from ..models import PostSummary, PostPlatform, User
from ..utils.dependencies import get_current_user
import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Get n8n webhook URLs from environment
N8N_BASE_URL = os.getenv("N8N_BASE_URL", "https://ganeshicogz.app.n8n.cloud")
N8N_SUMMARY_WEBHOOK = os.getenv("N8N_SUMMARY_WEBHOOK", "/webhook/summary")
N8N_POSTGEN_WEBHOOK = os.getenv("N8N_POSTGEN_WEBHOOK", "/webhook/generate-posts")
N8N_PUBLISH_WEBHOOK = os.getenv("N8N_PUBLISH_WEBHOOK", "/webhook/publish")

@router.post("/generate-summary")
async def generate_summary(
    summary_data: PostSummaryCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI summary via n8n without saving to database."""
    # Trigger n8n workflow for summary generation
    n8n_payload = {
        "user_id": str(current_user.id),
        "topic": summary_data.topic,
        "description": summary_data.description or "",
        "user_style": current_user.post_style or "",
        "user_focus": current_user.post_focus or "",
        "brand_info": current_user.brand_info or ""
    }
    try:
        n8n_url = f"{N8N_BASE_URL}{N8N_SUMMARY_WEBHOOK}"


        response = requests.post(n8n_url, json=n8n_payload)


        if response.status_code != 200:

            raise HTTPException(
                status_code=500,
                detail=f"n8n summary generation failed: {response.status_code}"
            )

        # Get the generated summary from n8n response
        summary_text = response.json().get("summary", "")

        return {
            "topic": summary_data.topic,
            "description": summary_data.description,
            "summary_text": summary_text,
            "generated": True
        }

    except requests.RequestException as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error calling n8n: {str(e)}")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/approve-summary")
async def approve_summary(
    summary_data: dict,  # { topic, description, summary_text }
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve and save the AI-generated summary to database."""
    # Create new post summary record with approved content
    post_summary = PostSummary(
        user_id=current_user.id,
        topic=summary_data.get("topic"),
        description=summary_data.get("description"),
        summary_text=summary_data.get("summary_text"),
        summary_approved=True
    )

    db.add(post_summary)
    db.commit()
    db.refresh(post_summary)

    return {
        "message": "Summary approved and saved",
        "summary_id": str(post_summary.id),
        "summary": post_summary
    }

@router.post("/generate-content")
async def generate_platform_content(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate posts for selected platforms via n8n without saving to database."""
    summary_id = request_data.get("summary_id")
    platforms = request_data.get("platforms", [])

    if not summary_id:
        raise HTTPException(status_code=400, detail="summary_id is required")

    if not platforms or len(platforms) == 0:
        raise HTTPException(status_code=400, detail="platforms list cannot be empty")

    # Verify summary exists and is approved
    post_summary = db.query(PostSummary).filter(
        PostSummary.id == summary_id,
        PostSummary.user_id == current_user.id
    ).first()

    if not post_summary:
        raise HTTPException(status_code=404, detail="Post summary not found")

    if not post_summary.summary_approved:
        raise HTTPException(status_code=400, detail="Summary not approved yet")

    if not post_summary.summary_text:
        raise HTTPException(status_code=400, detail="No summary text available")

    # Trigger n8n workflow for post generation
    n8n_payload = {
        "user_id": str(current_user.id),
        "summary_id": str(summary_id),
        "topic": post_summary.topic,
        "description": post_summary.description or "",
        "summary_text": post_summary.summary_text,
        "platforms": platforms,
        "user_style": current_user.post_style or "",
        "user_focus": current_user.post_focus or "",
        "brand_info": current_user.brand_info or ""
    }
    print(n8n_payload)

    try:
        n8n_url = f"{N8N_BASE_URL}{N8N_POSTGEN_WEBHOOK}"
        response = requests.post(n8n_url, json=n8n_payload, timeout=60)

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"n8n post generation failed: {response.status_code}"
            )

        # Get the generated platform content from n8n response
        platform_data = response.json().get("platforms", [])

        return {
            "summary_id": summary_id,
            "platforms": platform_data,
            "generated": True
        }

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error calling n8n: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/approve-content")
async def approve_platform_content(
    platform_data: dict,  # { platform_id, post_text, image_url }
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve and save platform-specific post content to database."""
    platform_id = platform_data.get("platform_id")

    # Check if platform record already exists
    platform_post = db.query(PostPlatform).filter(
        PostPlatform.id == platform_id
    ).first()

    if platform_post:
        # Update existing record
        platform_post.post_text = platform_data.get("post_text")
        platform_post.image_url = platform_data.get("image_url")
        platform_post.approved = True
        platform_post.updated_at = datetime.utcnow()
    else:
        # Create new platform record - this shouldn't happen in normal flow
        # but keeping as fallback
        platform_post = PostPlatform(
            id=platform_id,
            summary_id=platform_data.get("summary_id"),
            platform_name=platform_data.get("platform_name"),
            post_text=platform_data.get("post_text"),
            image_url=platform_data.get("image_url"),
            approved=True
        )
        db.add(platform_post)

    db.commit()
    db.refresh(platform_post)

    return {
        "message": f"Post approved for {platform_post.platform_name}",
        "platform_id": str(platform_post.id),
        "platform": platform_post
    }

@router.post("/publish")
async def publish_post(
    platform_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish approved post to platform via n8n."""
    platform_post = db.query(PostPlatform).join(PostSummary).filter(
        PostPlatform.id == platform_id,
        PostSummary.user_id == current_user.id
    ).first()

    if not platform_post:
        raise HTTPException(status_code=404, detail="Platform post not found")

    if not platform_post.approved:
        raise HTTPException(status_code=400, detail=f"Post not approved for {platform_post.platform_name}")

    if not platform_post.post_text:
        raise HTTPException(status_code=400, detail="No post content generated yet")

    # Trigger n8n workflow for publishing
    n8n_payload = {
        "user_id": str(current_user.id),
        "platform_id": str(platform_id),
        "platform_name": platform_post.platform_name,
        "post_text": platform_post.post_text,
        "image_url": platform_post.image_url or "",
        "summary_text": platform_post.summary.summary_text
    }

    try:
        n8n_url = f"{N8N_BASE_URL}{N8N_PUBLISH_WEBHOOK}"
        response = requests.post(n8n_url, json=n8n_payload, timeout=60)
        if response.status_code == 200:
            # Update publish status on success
            platform_post.published = True
            platform_post.published_at = datetime.utcnow()
        else:
            # Store error message on failure
            platform_post.error_message = f"n8n publishing failed: {response.status_code}"
    except Exception as e:
        print(f"Error calling n8n publish: {str(e)}")
        platform_post.error_message = f"Error calling n8n: {str(e)}"
        # Don't fail the request if n8n is not available

    platform_post.updated_at = datetime.utcnow()
    db.commit()

    return {
        "message": f"Post published to {platform_post.platform_name}",
        "platform_id": platform_id,
        "status": "published" if platform_post.published else "failed"
    }

@router.post("/publish-multiple")
async def publish_multiple_posts(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish multiple approved posts to their respective platforms via n8n."""
    platform_ids = request_data.get("platform_ids", [])

    if not platform_ids or len(platform_ids) == 0:
        raise HTTPException(status_code=400, detail="platform_ids list cannot be empty")

    results = []

    for platform_id in platform_ids:
        try:
            platform_post = db.query(PostPlatform).join(PostSummary).filter(
                PostPlatform.id == platform_id,
                PostSummary.user_id == current_user.id
            ).first()

            if not platform_post:
                results.append({
                    "platform_id": platform_id,
                    "status": "failed",
                    "error": "Platform post not found"
                })
                continue

            if not platform_post.approved:
                results.append({
                    "platform_id": platform_id,
                    "status": "failed",
                    "error": f"Post not approved for {platform_post.platform_name}"
                })
                continue

            if not platform_post.post_text:
                results.append({
                    "platform_id": platform_id,
                    "status": "failed",
                    "error": "No post content generated yet"
                })
                continue

            # Trigger n8n workflow for publishing
            n8n_payload = {
                "user_id": str(current_user.id),
                "platform_id": str(platform_id),
                "platform_name": platform_post.platform_name,
                "post_text": platform_post.post_text,
                "image_url": platform_post.image_url or "",
                "summary_text": platform_post.summary.summary_text
            }

            try:
                n8n_url = f"{N8N_BASE_URL}{N8N_PUBLISH_WEBHOOK}"
                response = requests.post(n8n_url, json=n8n_payload, timeout=60)

                if response.status_code == 200:
                    # Update publish status on success
                    platform_post.published = True
                    platform_post.published_at = datetime.utcnow()
                    status = "published"
                    error_msg = None
                else:
                    # Store error message on failure
                    platform_post.error_message = f"n8n publishing failed: {response.status_code}"
                    status = "failed"
                    error_msg = f"n8n publishing failed: {response.status_code}"

            except Exception as e:
                print(f"Error calling n8n publish: {str(e)}")
                platform_post.error_message = f"Error calling n8n: {str(e)}"
                status = "failed"
                error_msg = f"Error calling n8n: {str(e)}"

            platform_post.updated_at = datetime.utcnow()
            results.append({
                "platform_id": platform_id,
                "platform_name": platform_post.platform_name,
                "status": status,
                "error": error_msg
            })

        except Exception as e:
            results.append({
                "platform_id": platform_id,
                "status": "failed",
                "error": str(e)
            })

    db.commit()

    return {
        "message": f"Processed {len(platform_ids)} platforms",
        "results": results
    }

@router.post("/create-platform-records")
async def create_platform_records(
    platform_data: List[dict],  # List of { summary_id, platform_name }
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create platform records for approved content."""
    created_records = []

    for data in platform_data:
        summary_id = data.get("summary_id")
        platform_name = data.get("platform_name")

        # Verify summary exists and belongs to user
        post_summary = db.query(PostSummary).filter(
            PostSummary.id == summary_id,
            PostSummary.user_id == current_user.id
        ).first()

        if not post_summary:
            continue

        # Create platform record
        platform_record = PostPlatform(
            summary_id=summary_id,
            platform_name=platform_name
        )
        db.add(platform_record)
        created_records.append({
            "summary_id": summary_id,
            "platform_name": platform_name,
            "platform_id": str(platform_record.id)
        })

    db.commit()

    return {
        "message": f"Created {len(created_records)} platform records",
        "records": created_records
    }

@router.get("/history", response_model=List[PostWithPlatformsResponse])
async def get_user_posts_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all posts with their platforms for the current user."""
    summaries = db.query(PostSummary).filter(
        PostSummary.user_id == current_user.id
    ).all()

    result = []
    for summary in summaries:
        platforms = db.query(PostPlatform).filter(
            PostPlatform.summary_id == summary.id
        ).all()

        result.append({
            "summary": summary,
            "platforms": platforms
        })

    return result

@router.get("/summary/{summary_id}", response_model=PostWithPlatformsResponse)
async def get_post_with_platforms(
    summary_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific post summary with its platforms."""
    summary = db.query(PostSummary).filter(
        PostSummary.id == summary_id,
        PostSummary.user_id == current_user.id
    ).first()

    if not summary:
        raise HTTPException(status_code=404, detail="Post summary not found")

    platforms = db.query(PostPlatform).filter(
        PostPlatform.summary_id == summary_id
    ).all()

    return {
        "summary": summary,
        "platforms": platforms
    }
