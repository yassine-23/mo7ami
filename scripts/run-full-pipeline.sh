#!/bin/bash
# Full Legal Document Ingestion Pipeline for Mo7ami
# Downloads, extracts, and ingests all Moroccan legal codes

set -e  # Exit on error

echo "================================================================================"
echo "🇲🇦 Mo7ami - Full Legal Document Ingestion Pipeline"
echo "================================================================================"
echo ""

# Check Python version
echo "🐍 Checking Python version..."
python3 --version

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo ""
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo ""
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install requests tqdm PyMuPDF python-dotenv openai supabase

# Check environment variables
echo ""
echo "🔑 Checking environment variables..."
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY not set"
fi
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_SUPABASE_URL not set"
fi
if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "⚠️  Warning: SUPABASE_SERVICE_ROLE_KEY not set"
fi

# Step 1: Download legal documents
echo ""
echo "================================================================================"
echo "📥 STEP 1: Downloading Legal Documents"
echo "================================================================================"
python3 scripts/download-legal-docs.py

if [ $? -ne 0 ]; then
    echo "❌ Download failed. Exiting."
    exit 1
fi

# Step 2: Extract and parse legal text
echo ""
echo "================================================================================"
echo "📖 STEP 2: Extracting and Parsing Legal Text"
echo "================================================================================"
python3 scripts/extract-legal-text.py

if [ $? -ne 0 ]; then
    echo "❌ Extraction failed. Exiting."
    exit 1
fi

# Step 3: Ingest to database with embeddings
echo ""
echo "================================================================================"
echo "💾 STEP 3: Ingesting to Database with Embeddings"
echo "================================================================================"
python3 scripts/ingest-to-database.py

if [ $? -ne 0 ]; then
    echo "❌ Ingestion failed. Exiting."
    exit 1
fi

# Success
echo ""
echo "================================================================================"
echo "✅ PIPELINE COMPLETE!"
echo "================================================================================"
echo ""
echo "📊 Summary:"
echo "   • Legal documents downloaded to: backend/data/legal_docs/"
echo "   • Processed data saved to: backend/data/processed/"
echo "   • Documents ingested to Supabase with vector embeddings"
echo ""
echo "🚀 Your Mo7ami RAG pipeline is now ready with real Moroccan legal content!"
echo "================================================================================"
