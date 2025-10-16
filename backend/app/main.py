import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .database import get_db, engine
from .models import Base
from .routers import auth, posts, trends

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Content Generation Platform",
    description="Backend API for AI-powered content generation and multi-platform publishing",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000","http://10.0.0.245:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
app.include_router(posts.router, prefix="/posts", tags=["posts"])
app.include_router(trends.router, prefix="/trends", tags=["trends"])

@app.get("/")
async def root():
    return {"message": "AI Content Generation Platform API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2023-10-01T00:00:00Z"}

# Add error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "detail": str(exc)}
    )
