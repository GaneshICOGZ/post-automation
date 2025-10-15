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
    """Generate AI summary via n8n and save to database."""
    # Trigger n8n workflow for summary generation
    n8n_payload = {
        "user_id": str(current_user.id),
        "topic": summary_data.topic,
        "user_name": current_user.name or "",
        "user_preferences": current_user.preferences or []
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

        # Save summary to database immediately
        post_summary = PostSummary(
            user_id=current_user.id,
            topic=summary_data.topic,
            summary_text=summary_text,
            summary_approved=False  # Not approved yet
        )

        db.add(post_summary)
        db.commit()
        db.refresh(post_summary)

        return {
            "summary_id": str(post_summary.id),
            "topic": summary_data.topic,
            "summary_text": summary_text,
            "summary_approved": False,
            "generated": True,
            "message": "Summary generated and saved to database"
        }

    except requests.RequestException as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Error calling n8n: {str(e)}")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/approve-summary")
async def approve_summary(
    request_data: dict,  # { summary_id }
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve an existing AI-generated summary in database."""
    summary_id = request_data.get("summary_id")

    if not summary_id:
        raise HTTPException(status_code=400, detail="summary_id is required")

    # Find existing summary
    post_summary = db.query(PostSummary).filter(
        PostSummary.id == summary_id,
        PostSummary.user_id == current_user.id
    ).first()

    if not post_summary:
        raise HTTPException(status_code=404, detail="Post summary not found")

    if not post_summary.summary_text:
        raise HTTPException(status_code=400, detail="No summary text available to approve")

    # Update approval status
    post_summary.summary_approved = True
    post_summary.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(post_summary)

    return {
        "message": "Summary approved successfully",
        "summary_id": str(post_summary.id),
        "summary": post_summary,
        "approved": True
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
        "summary_text": post_summary.summary_text,
        "platforms": platforms,
        "user_name": current_user.name or "",
        "user_preferences": current_user.preferences or []
    }

    try:
        n8n_url = f"{N8N_BASE_URL}{N8N_POSTGEN_WEBHOOK}"
        response = requests.post(n8n_url, json=n8n_payload, timeout=60)

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"n8n post generation failed: {response.status_code}"
            )

        # Parse n8n response and create platform records
        n8n_response = response.json()
        platforms_list = n8n_response.get("Platforms", [])
        image_url = n8n_response.get("image url", "")

        # Create platform records for each platform
        created_platforms = []
        for platform_name in platforms_list:
            # Map platform names to proper format
            platform_map = {
                "x": "twitter",
                "facebook": "facebook",
                "linkedin": "linkedin",
                "instagram": "instagram",
                "youtube": "youtube"
            }

            clean_platform_name = platform_map.get(platform_name.lower(), platform_name.lower())

            # Get platform-specific content
            content_key = f"{clean_platform_name.title()} Post"
            if clean_platform_name == "twitter":
                content_key = "X Post"
            elif clean_platform_name == "facebook":
                content_key = "facebook Caption"
            elif clean_platform_name == "instagram":
                content_key = "Instagram Caption"
            elif clean_platform_name == "linkedin":
                content_key = "LinkedIn Post"
            elif clean_platform_name == "youtube":
                content_key = "youtube Caption"

            post_content = n8n_response.get(content_key, "")

            # Create platform record in database
            platform_record = PostPlatform(
                summary_id=summary_id,
                platform_name=clean_platform_name,
                post_text=post_content,
                image_url=image_url
            )
            db.add(platform_record)
            db.commit()
            created_platforms.append({
                "platform_id": str(platform_record.id),
                "platform_name": clean_platform_name,
                "post_text": post_content,
                "image_url": image_url
            })


        return {
            "summary_id": summary_id,
            "platforms": created_platforms,
            "generated": True,
            "message": f"Generated content for {len(created_platforms)} platforms"
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

@router.post("/regenerate-text")
async def regenerate_text(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate text content with user suggestions via n8n/Gemini."""
    summary_id = request_data.get("summary_id")
    platform_id = request_data.get("platform_id")
    user_suggestions = request_data.get("suggestions", "")
    content_type = request_data.get("content_type", "summary")  # "summary" or "post"

    if not summary_id:
        raise HTTPException(status_code=400, detail="summary_id is required")

    # Verify summary exists and belongs to user
    post_summary = db.query(PostSummary).filter(
        PostSummary.id == summary_id,
        PostSummary.user_id == current_user.id
    ).first()

    if not post_summary:
        raise HTTPException(status_code=404, detail="Post summary not found")

    # Handle different content types
    if content_type == "summary":
        # Regenerate summary text
        existing_content = post_summary.summary_text or ""
        if not existing_content:
            raise HTTPException(
                status_code=400,
                detail="No summary text available to regenerate. Generate summary first."
            )

        context = f"Topic: {post_summary.topic}\nCurrent summary: {existing_content}"

        # Trigger n8n workflow for summary regeneration
        n8n_payload = {
            "user_id": str(current_user.id),
            "summary_id": str(summary_id),
            "content_type": "summary",
            "existing_content": existing_content,
            "user_suggestions": user_suggestions,
            "context": context,
            "user_name": current_user.name or "",
            "user_preferences": current_user.preferences or []
        }

        try:
            n8n_url = f"{N8N_BASE_URL}{N8N_SUMMARY_WEBHOOK}"
            response = requests.post(n8n_url, json=n8n_payload, timeout=60)

            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"n8n summary regeneration failed: {response.status_code}"
                )

            # Get the regenerated summary from n8n response
            regenerated_content = response.json().get("summary", "")

            return {
                "summary_id": summary_id,
                "content_type": "summary",
                "original_content": existing_content,
                "regenerated_content": regenerated_content,
                "user_suggestions": user_suggestions,
                "success": True,
                "message": "Summary text regenerated successfully"
            }

        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Error calling n8n: {str(e)}")

    elif content_type == "post":
        # Regenerate platform-specific post text
        if not platform_id:
            raise HTTPException(status_code=400, detail="platform_id is required for post regeneration")

        platform_post = db.query(PostPlatform).filter(
            PostPlatform.id == platform_id,
            PostPlatform.summary_id == summary_id
        ).first()

        if not platform_post:
            raise HTTPException(status_code=404, detail="Platform post not found")

        existing_content = platform_post.post_text or ""
        if not existing_content:
            raise HTTPException(
                status_code=400,
                detail="No post content available to regenerate. Generate content first."
            )

        context = f"Platform: {platform_post.platform_name}\nSummary: {post_summary.summary_text}\nCurrent post: {existing_content}"

        # Trigger n8n workflow for post regeneration
        n8n_payload = {
            "user_id": str(current_user.id),
            "summary_id": str(summary_id),
            "platform_id": str(platform_id),
            "content_type": "post",
            "existing_content": existing_content,
            "user_suggestions": user_suggestions,
            "context": context,
            "platform_name": platform_post.platform_name,
            "user_name": current_user.name or "",
            "user_preferences": current_user.preferences or []
        }

        try:
            n8n_url = f"{N8N_BASE_URL}{N8N_POSTGEN_WEBHOOK}"
            response = requests.post(n8n_url, json=n8n_payload, timeout=60)

            if response.status_code != 200:
                raise HTTPException(
                    status_code=500,
                    detail=f"n8n post regeneration failed: {response.status_code}"
                )

            # Get the regenerated post content from n8n response
            regenerated_content = response.json().get("regenerated_content", "")

            return {
                "summary_id": summary_id,
                "platform_id": platform_id,
                "content_type": "post",
                "platform_name": platform_post.platform_name,
                "original_content": existing_content,
                "regenerated_content": regenerated_content,
                "user_suggestions": user_suggestions,
                "success": True,
                "message": f"Post text regenerated successfully for {platform_post.platform_name}"
            }

        except requests.RequestException as e:
            raise HTTPException(status_code=500, detail=f"Error calling n8n: {str(e)}")

    else:
        raise HTTPException(
            status_code=400,
            detail="content_type must be either 'summary' or 'post'"
        )

@router.post("/regenerate-image")
async def regenerate_image(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Regenerate image content with user suggestions via n8n/Gemini."""
    summary_id = request_data.get("summary_id")
    user_suggestions = request_data.get("suggestions", "")

    if not summary_id:
        raise HTTPException(status_code=400, detail="summary_id is required")

    # Verify summary exists and belongs to user
    post_summary = db.query(PostSummary).filter(
        PostSummary.id == summary_id,
        PostSummary.user_id == current_user.id
    ).first()

    if not post_summary:
        raise HTTPException(status_code=404, detail="Post summary not found")

    if not post_summary.summary_text:
        raise HTTPException(status_code=400, detail="No summary text available for image generation")

    # Get all platform content for this summary
    platforms = db.query(PostPlatform).filter(
        PostPlatform.summary_id == summary_id
    ).all()

    # Build comprehensive context with summary and all platform content
    summary_content = f"Topic: {post_summary.topic}\nSummary: {post_summary.summary_text}"

    platform_contents = []
    for platform in platforms:
        if platform.post_text:
            platform_contents.append(f"{platform.platform_name}: {platform.post_text}")

    all_content = summary_content + "\n\nPlatform Content:\n" + "\n".join(platform_contents) if platform_contents else summary_content

    # Trigger n8n workflow for image regeneration with full context
    n8n_payload = {
        "user_id": str(current_user.id),
        "summary_id": str(summary_id),
        "summary_content": post_summary.summary_text,
        "topic": post_summary.topic,
        # Removed description field
        "all_content": all_content,
        "platform_contents": platform_contents,
        "user_suggestions": user_suggestions,
        "regenerate_type": "image",
        "user_name": current_user.name or "",
        "user_preferences": current_user.preferences or []
    }

    try:
        n8n_url = f"{N8N_BASE_URL}{N8N_POSTGEN_WEBHOOK}"
        response = requests.post(n8n_url, json=n8n_payload, timeout=60)

        if response.status_code != 200:
            raise HTTPException(
                status_code=500,
                detail=f"n8n image regeneration failed: {response.status_code}"
            )

        # Get the regenerated image URL from n8n response
        regenerated_image_url = response.json().get("regenerated_image_url", "")

        if not regenerated_image_url:
            raise HTTPException(status_code=500, detail="No image URL returned from n8n")

        # Update image URL for all platforms associated with this summary
        updated_count = 0
        for platform in platforms:
            platform.image_url = regenerated_image_url
            platform.updated_at = datetime.utcnow()
            updated_count += 1

        db.commit()

        return {
            "summary_id": summary_id,
            "regenerated_image_url": regenerated_image_url,
            "updated_platforms": len(platforms),
            "user_suggestions": user_suggestions,
            "context_used": {
                "summary": post_summary.summary_text[:100] + "...",
                "platforms": len(platforms),
                "all_content_length": len(all_content)
            },
            "success": True,
            "message": f"Image regenerated and updated for {updated_count} platforms successfully"
        }

    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error calling n8n: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.post("/update-content")
async def update_content(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update existing content with regenerated text or image."""
    summary_id = request_data.get("summary_id")
    platform_id = request_data.get("platform_id")
    content_type = request_data.get("content_type", "post")  # "summary" or "post"
    new_content = request_data.get("new_content", "")
    new_image_url = request_data.get("new_image_url", "")

    if not summary_id:
        raise HTTPException(status_code=400, detail="summary_id is required")

    # Verify summary exists and belongs to user
    post_summary = db.query(PostSummary).filter(
        PostSummary.id == summary_id,
        PostSummary.user_id == current_user.id
    ).first()

    if not post_summary:
        raise HTTPException(status_code=404, detail="Post summary not found")

    if content_type == "summary":
        # Update summary text
        post_summary.summary_text = new_content
        post_summary.updated_at = datetime.utcnow()

        message = "Summary text updated successfully"
    else:
        # Update platform-specific content
        if not platform_id:
            raise HTTPException(status_code=400, detail="platform_id is required for post content update")

        platform_post = db.query(PostPlatform).filter(
            PostPlatform.id == platform_id,
            PostPlatform.summary_id == summary_id
        ).first()

        if not platform_post:
            raise HTTPException(status_code=404, detail="Platform post not found")

        # Update content and/or image
        if new_content:
            platform_post.post_text = new_content
        if new_image_url:
            platform_post.image_url = new_image_url

        platform_post.updated_at = datetime.utcnow()
        message = f"Post content updated for {platform_post.platform_name}"

    db.commit()

    return {
        "summary_id": summary_id,
        "platform_id": platform_id,
        "content_type": content_type,
        "updated": True,
        "message": message
    }

@router.post("/update-image")
async def update_image_for_all_platforms(
    request_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update image URL for all platforms associated with a summary."""
    summary_id = request_data.get("summary_id")
    image_url = request_data.get("image_url")

    if not summary_id:
        raise HTTPException(status_code=400, detail="summary_id is required")

    if not image_url:
        raise HTTPException(status_code=400, detail="image_url is required")

    # Verify summary exists and belongs to user
    post_summary = db.query(PostSummary).filter(
        PostSummary.id == summary_id,
        PostSummary.user_id == current_user.id
    ).first()

    if not post_summary:
        raise HTTPException(status_code=404, detail="Post summary not found")

    # Find all platforms for this summary
    platforms = db.query(PostPlatform).filter(
        PostPlatform.summary_id == summary_id
    ).all()

    if not platforms:
        raise HTTPException(status_code=404, detail="No platforms found for this summary")

    # Update image URL for all platforms
    updated_platforms = []
    for platform in platforms:
        platform.image_url = image_url
        platform.updated_at = datetime.utcnow()
        updated_platforms.append({
            "platform_id": str(platform.id),
            "platform_name": platform.platform_name,
            "image_url": image_url
        })

    db.commit()

    return {
        "summary_id": summary_id,
        "image_url": image_url,
        "updated_platforms": updated_platforms,
        "message": f"Image updated for {len(updated_platforms)} platforms",
        "success": True
    }

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
