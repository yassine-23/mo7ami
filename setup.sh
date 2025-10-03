#!/bin/bash

# Mo7ami Setup Script
# This script helps set up the development environment

set -e

echo "🚀 Setting up Mo7ami Legal Chatbot..."
echo ""

# Check if required tools are installed
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required but not installed. Please install Node.js 18+"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 is required but not installed. Please install Python 3.10+"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "⚠️  PostgreSQL client not found. Please ensure PostgreSQL is installed."; }

echo "✅ Prerequisites check passed"
echo ""

# Frontend setup
echo "📦 Installing frontend dependencies..."
npm install
echo "✅ Frontend dependencies installed"
echo ""

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
python3 -m pip install -r requirements.txt
cd ..
echo "✅ Backend dependencies installed"
echo ""

# Environment files
if [ ! -f .env ]; then
    echo "📝 Creating frontend .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your credentials"
fi

if [ ! -f backend/.env ]; then
    echo "📝 Creating backend .env file..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please update backend/.env with your credentials"
fi
echo ""

# Prisma setup
echo "🗄️  Setting up Prisma..."
npx prisma generate
echo "✅ Prisma client generated"
echo ""

echo "✨ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env and backend/.env with your API keys and credentials"
echo "2. Set up PostgreSQL database:"
echo "   - Create database: createdb mo7ami"
echo "   - Enable pgvector: psql mo7ami -c 'CREATE EXTENSION vector;'"
echo "3. Run database migrations: npx prisma migrate dev"
echo "4. Start development servers:"
echo "   - Frontend: npm run dev"
echo "   - Backend: cd backend && python -m uvicorn main:app --reload"
echo ""
echo "📚 Or use Docker Compose:"
echo "   docker-compose up -d"
echo ""
echo "🎉 Happy coding!"
