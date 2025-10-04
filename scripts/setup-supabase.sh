#!/bin/bash

# Mo7ami Supabase Setup Script
# This script helps configure Supabase connection

echo "🚀 Mo7ami - Supabase Setup Helper"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "✅ .env file created"
else
  echo "✅ .env file already exists"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create a Supabase project at https://supabase.com"
echo "2. Enable the 'vector' extension in Database → Extensions"
echo "3. Copy your connection details from Settings → Database"
echo "4. Update your .env file with:"
echo "   - DATABASE_URL"
echo "   - DIRECT_URL"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "5. Run: npx prisma generate"
echo "6. Run: npx prisma db push"
echo "7. Execute SQL migrations in Supabase SQL Editor:"
echo "   - supabase/migrations/001_enable_vector.sql"
echo "   - supabase/migrations/002_vector_search_functions.sql"
echo "   - supabase/migrations/003_vector_indexes.sql"
echo ""
echo "📖 For detailed instructions, see: SUPABASE_SETUP.md"
echo ""
