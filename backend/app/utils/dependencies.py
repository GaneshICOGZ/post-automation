from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from .auth import decode_token
import json

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get the current authenticated user."""
    token = credentials.credentials
    payload = decode_token(token)

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user

def parse_json_field(field_value: str) -> dict:
    """Safely parse JSON string to dict."""
    try:
        if field_value and field_value.strip():
            return json.loads(field_value)
        return {}
    except (json.JSONDecodeError, TypeError):
        return {}

def serialize_json_field(data: dict) -> str:
    """Serialize dict to JSON string."""
    if data:
        return json.dumps(data)
    return "{}"
