# AI-Powered Content Generation & Multi-Platform Publishing Platform

A full-stack web application that leverages AI (Gemini) to generate content summaries, posts, and images, then automatically publishes them across multiple social media platforms using n8n workflow automation.

## 🚀 Features

- **User Authentication**: JWT-based secure authentication system
- **Content Generation**: AI-powered summary and post generation using Gemini
- **Multi-Platform Publishing**: Automated publishing to Facebook, LinkedIn, Twitter, Instagram
- **Trending Topics**: Google Trends integration for content suggestions
- **Dashboard**: Comprehensive analytics and content management
- **Approval Workflow**: Review and approve AI-generated content before publishing
- **Workflow Automation**: n8n integration for complex business logic

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 16+**
- **PostgreSQL 13+**
- **n8n** (for workflow automation)
- **Git**

### API Keys Required

- **Google Gemini API Key** (for AI content generation)
- **OpenAI API Key** (for DALL-E image generation)
- **Google Trends** (via pytrends - no API key needed)
- **Social Media APIs** (Facebook, Twitter, LinkedIn, Instagram) - optional for development

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ai-content-platform
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your API keys and database URL

# Set up PostgreSQL database
# Create database: ai_postgen
createdb ai_postgen

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm start
```

### 4. n8n Workflow Setup

```bash
# Install n8n
npm install n8n -g

# Start n8n
n8n start

# Access n8n at http://localhost:5678
```

### 5. Import n8n Workflows

1. In n8n, import the workflows from the `n8n/` directory:
   - `summary_workflow.json` - AI summary generation
   - `postgen_workflow.json` - Post and image generation
   - `publish_workflow.json` - Multi-platform publishing

2. Configure API credentials in n8n:
   - Google Gemini API
   - OpenAI API (for DALL-E)
   - Social media platform APIs

## 🔧 Environment Configuration

### Backend (.env file)

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/ai_postgen

# JWT
JWT_SECRET_KEY=your-256-bit-secret-key-here
JWT_ALGORITHM=HS256

# AI APIs
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# n8n Configuration
N8N_BASE_URL=http://localhost:5678
N8N_SUMMARY_WEBHOOK=/webhook/summary
N8N_POSTGEN_WEBHOOK=/webhook/generate-posts
N8N_PUBLISH_WEBHOOK=/webhook/publish

# Social Media APIs (for production)
FACEBOOK_APP_ID=your_facebook_app_id
LINKEDIN_CLIENT_ID=your_linkedin_client_id
TWITTER_API_KEY=your_twitter_api_key
```

## 🏗️ Project Structure

```
ai-content-platform/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── database.py     # Database configuration
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routers/        # API endpoints
│   │   └── utils/          # Utilities (auth, dependencies)
│   ├── alembic/            # Database migrations
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment template
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── api/            # API client
│   │   ├── context/        # React context
│   │   └── utils/          # Utilities
│   ├── public/
│   └── package.json
├── n8n/                    # n8n workflow definitions
│   ├── summary_workflow.json
│   ├── postgen_workflow.json
│   └── publish_workflow.json
└── README.md
```

## 🔄 Workflow Overview

1. **User Registration**: Users sign up with preferences
2. **Topic Selection**: Choose from trending topics or enter custom topics
3. **Content Creation**: Enter topic and description
4. **AI Summary Generation**: n8n triggers Gemini to create content summary
5. **Summary Approval**: User reviews and approves AI-generated summary
6. **Platform Selection**: Choose target social media platforms
7. **Content Generation**: AI generates platform-specific posts and images
8. **Content Approval**: Review and approve each platform's content
9. **Publishing**: Automated publishing via n8n workflows
10. **Analytics**: Track performance across all platforms

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### API Testing

The backend provides interactive API documentation at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## 🚀 Deployment

### Backend Deployment

```bash
# Using Docker
docker build -t ai-content-backend .
docker run -p 8000:8000 ai-content-backend

# Or using uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend Deployment

```bash
cd frontend
npm run build
# Serve the build folder using nginx/apache
```

## 🛡️ Security Considerations

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **API Rate Limiting**: Implement rate limiting for production
- **HTTPS**: Always use HTTPS in production
- **Environment Variables**: Never commit sensitive data to version control
- **Input Validation**: All inputs are validated using Pydantic models

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env file
- Ensure all Python dependencies are installed

**Frontend API errors:**
- Check if backend is running on port 8000
- Verify API_BASE_URL in frontend
- Check browser console for CORS errors

**n8n workflow errors:**
- Ensure n8n is running on port 5678
- Verify webhook URLs in .env file
- Check API credentials in n8n

**AI content generation fails:**
- Verify Gemini and OpenAI API keys
- Check API rate limits
- Ensure n8n credentials are configured correctly

## 📞 Support

For questions and support, please open an issue in the GitHub repository.

---

## 🎯 Quick Start Commands

```bash
# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your keys
alembic upgrade head
uvicorn app.main:app --reload

# Frontend setup (new terminal)
cd frontend
npm install
npm start

# n8n setup (new terminal)
n8n start
# Import workflows from n8n/ directory
```

Access the application at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- n8n: http://localhost:5678
