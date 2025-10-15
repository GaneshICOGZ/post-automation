from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from uuid import UUID

class UserBase(BaseModel):
    name: str
    email: EmailStr
    preferences: Optional[List[str]] = None

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    preferences: Optional[List[str]] = None

    @validator('password')
    def password_required(cls, v):
        if not v or v.strip() == '':
            raise ValueError('Password is required')
        return v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    preferences: Optional[List[str]] = None

class UserResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    preferences: Optional[List[str]] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, obj):
        """Convert SQLAlchemy object to Pydantic model"""
        # Convert to dict first to handle data transformation
        data_dict = {
            'id': obj.id,
            'name': obj.name,
            'email': obj.email,
            'preferences': obj.preferences
        }

        # Convert JSON string preferences back to list
        if isinstance(data_dict['preferences'], str):
            try:
                import json
                # Handle both JSON string and string representation of list
                if data_dict['preferences'].startswith('[') and data_dict['preferences'].endswith(']'):
                    # Try to parse as JSON first
                    data_dict['preferences'] = json.loads(data_dict['preferences'])
                else:
                    data_dict['preferences'] = []
            except (json.JSONDecodeError, TypeError, ValueError):
                # If JSON parsing fails, try to handle as string representation of list
                try:
                    # Handle cases like "['item1', 'item2']"
                    import ast
                    data_dict['preferences'] = ast.literal_eval(data_dict['preferences'])
                except (ValueError, SyntaxError):
                    data_dict['preferences'] = []
        elif data_dict['preferences'] is None:
            data_dict['preferences'] = []

        # Use model_validate instead of deprecated from_orm
        return cls.model_validate(data_dict)
