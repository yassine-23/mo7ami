# Mo7ami Quick Start Guide

This guide will help you get Mo7ami up and running in under 10 minutes.

## Prerequisites

Make sure you have the following installed:
- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** 14+ with pgvector extension
- **Git**

## Step 1: Initial Setup

Run the automated setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
- Install all npm dependencies
- Install Python dependencies
- Generate Prisma client
- Create .env files from examples

## Step 2: Configure Environment Variables

### Frontend (.env)

Update these essential variables:

```bash
# Google OAuth (get from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_random_secret_key

# Database
DATABASE_URL=postgresql://mo7ami_user:password@localhost:5432/mo7ami
```

### Backend (backend/.env)

Update these essential variables:

```bash
# OpenAI API Key (get from https://platform.openai.com)
OPENAI_API_KEY=sk-...

# Database
DATABASE_URL=postgresql+asyncpg://mo7ami_user:password@localhost:5432/mo7ami

# Google Cloud credentials (optional for voice features)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=./gcp-credentials.json
```

## Step 3: Database Setup

### Option A: Using Docker (Recommended)

```bash
docker-compose up -d postgres redis
```

### Option B: Manual Setup

1. Create database:
```bash
createdb mo7ami
```

2. Enable pgvector extension:
```bash
psql mo7ami -c "CREATE EXTENSION vector;"
```

3. Run migrations:
```bash
npx prisma migrate dev
```

## Step 4: Start Development Servers

### Option A: Using Docker Compose (Full Stack)

```bash
docker-compose up
```

Access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option B: Manual Start

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload
```

## Step 5: Verify Installation

1. **Frontend**: Open http://localhost:3000
   - You should see the Mo7ami home page
   - Try clicking "ابدأ المحادثة / Commencer"

2. **Backend**: Open http://localhost:8000/health
   - You should see a JSON response with `"status": "healthy"`

3. **API Docs**: Open http://localhost:8000/docs
   - Interactive API documentation (Swagger UI)

## Step 6: Set Up Google OAuth (Optional but Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
5. Add authorized redirect URI:
   - `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to your `.env` file

## Step 7: Test Voice Features (Optional)

To enable voice features:

1. Set up Google Cloud Speech API:
   - Enable "Cloud Speech-to-Text API" and "Cloud Text-to-Speech API"
   - Create service account and download JSON credentials
   - Save as `backend/gcp-credentials.json`
   - Update `GOOGLE_APPLICATION_CREDENTIALS` in `backend/.env`

2. Test voice:
   - Click the microphone icon in the chat
   - Grant microphone permissions
   - Speak a question in Arabic or French

## Common Issues

### Port Already in Use

If ports 3000 or 8000 are busy:

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Database Connection Error

Check your DATABASE_URL in both `.env` files:
- Frontend uses `postgresql://...`
- Backend uses `postgresql+asyncpg://...`

### Python Dependencies Error

Try upgrading pip first:
```bash
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

## Next Steps

Now that Mo7ami is running:

1. **Add Legal Documents**: Populate the database with Moroccan legal texts
   - Check `backend/data/sources/` directory
   - Run document ingestion scripts (coming soon)

2. **Customize the UI**: Modify components in `components/` directory

3. **Extend the API**: Add new endpoints in `backend/app/api/`

4. **Test with Real Queries**: Try asking legal questions in Arabic or French

## Development Tips

- **Hot Reload**: Both frontend and backend support hot reload
- **Database UI**: Use `npx prisma studio` for visual database management
- **Logs**: Backend logs are in `backend/logs/mo7ami.log`
- **API Testing**: Use the Swagger UI at `/docs` for testing API endpoints

## Getting Help

- **Documentation**: Check the full [README.md](README.md)
- **Issues**: Report bugs on GitHub Issues
- **CLAUDE.md**: See project-specific guidelines for Claude Code

## Production Deployment

For production deployment guide, see [DEPLOYMENT.md](DEPLOYMENT.md) (coming soon).

---

🎉 **You're all set! Start chatting with Mo7ami!**

محامي - مساعدك القانوني الذكي 🇲🇦
