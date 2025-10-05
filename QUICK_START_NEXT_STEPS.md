# 🚀 Mo7ami - Quick Start Guide (Next Steps)

## ✅ WHAT WE'VE ACCOMPLISHED

**5,320 legal articles** extracted from 8 major Moroccan legal codes!

- ✅ Moudawana (406 articles)
- ✅ Code Pénal (714 articles)
- ✅ Code Général des Impôts 2024 (2,042 articles)
- ✅ Code Obligations & Contrats (1,262 articles)
- ✅ Code Procédure Civile (534 articles)
- ✅ Code Procédure Pénale (362 articles)
- ✅ Full download & extraction pipelines built

---

## 🎯 WHAT'S NEXT (3 Steps to Complete RAG)

### Step 1: Set Up Supabase (5 minutes)

**Option A: Create New Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create account / Sign in
3. Click "New Project"
4. Choose name: `mo7ami` or `morocco-legal`
5. Set strong password
6. Select region: `Europe (Frankfurt)` (closest to Morocco)
7. Wait 2 minutes for project creation

**Option B: Use Existing Supabase Project**
1. Sign in to supabase.com
2. Select your existing project
3. Continue to Step 2

---

### Step 2: Get Supabase Credentials (3 minutes)

1. **In Supabase Dashboard:**
   - Click "Settings" (⚙️ icon, bottom left)
   - Click "API"
   - Copy these values:

2. **Project URL:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   ```

3. **Service Role Key (Secret!):**
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Database URL:**
   - Click "Settings" → "Database"
   - Scroll to "Connection String"
   - Select "URI" tab
   - Copy both:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   - Replace `[PASSWORD]` with your database password

5. **Add to `.env` file:**
   ```bash
   cd /Users/yassinedrani/Desktop/mo7ami
   nano .env
   ```

   Add these lines:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your_service_key
   DATABASE_URL=postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
   DIRECT_URL=postgresql://postgres:yourpassword@db.xxxxx.supabase.co:5432/postgres
   ```

   Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

### Step 3: Run Database Setup & Ingestion (45 minutes)

```bash
cd /Users/yassinedrani/Desktop/mo7ami

# 1. Generate Prisma client (30 seconds)
npx prisma generate

# 2. Run database migrations (1 minute)
npx prisma migrate dev --name initial_legal_schema

# 3. Enable pgvector in Supabase
# Go to Supabase Dashboard → SQL Editor → New Query
# Run this SQL:
CREATE EXTENSION IF NOT EXISTS vector;

# 4. Run ingestion pipeline (30-60 minutes)
python3 scripts/ingest-to-database.py

# This will:
# - Process 5,320 articles
# - Generate ~15,960 embeddings via OpenAI
# - Store in Supabase with vector search enabled
# - Show progress bar as it runs
```

---

## 📊 Expected Output During Ingestion

```
================================================================================
💾 Mo7ami Database Ingestion Pipeline
================================================================================

📚 Total documents to ingest: 8
📄 Total articles: 5,320

📥 Ingesting: Code de la Famille (Moudawana)
   📄 Created document: Code de la Famille (Moudawana) (ID: abc123)
   Processing articles: 100%|██████████| 406/406 [05:30<00:00, 1.2it/s]
   ✅ Ingested 406 articles, 1,218 chunks

📥 Ingesting: Code Pénal Marocain
   📄 Created document: Code Pénal Marocain (ID: def456)
   Processing articles: 100%|██████████| 714/714 [09:45<00:00, 1.2it/s]
   ✅ Ingested 714 articles, 2,142 chunks

...

================================================================================
📊 Ingestion Summary
================================================================================
✅ Successfully ingested: 8/8 documents
📄 Total articles in database: 5,320
🧩 Total chunks with embeddings: 15,960

✅ Ingestion complete! RAG pipeline ready.
================================================================================
```

---

## 🧪 Testing Your RAG Pipeline

### Test 1: Arabic Query (Darija)

```bash
# Visit: http://localhost:3000/chat
# Ask: "شنو كايقول القانون على السرقة؟"
# Expected: Response citing Code Pénal Article 505
```

### Test 2: French Query

```bash
# Ask: "Quels sont mes droits en cas de divorce?"
# Expected: Response citing Moudawana Articles 78-93
```

### Test 3: Tax Query

```bash
# Ask: "كيفاش نحسب الضريبة على الدخل؟"
# Expected: Response citing CGI 2024 Articles 73-87
```

### Verify Citations

Each response should include:
- ✅ Exact article number
- ✅ Code name
- ✅ Official reference (Bulletin Officiel)
- ✅ Relevant excerpt from article text

---

## 🔧 Troubleshooting

### Error: "Prisma schema is out of sync"
```bash
npx prisma generate
npx prisma migrate dev
```

### Error: "pgvector extension not found"
```sql
-- In Supabase SQL Editor:
CREATE EXTENSION IF NOT EXISTS vector;
```

### Error: "OpenAI API rate limit"
```bash
# Wait 60 seconds, script will auto-retry
# Or reduce batch size in ingest-to-database.py
```

### Error: "Supabase connection timeout"
```bash
# Check DIRECT_URL is set correctly in .env
# Verify database password is correct
```

---

## 📁 Key Files Reference

| File | Purpose |
|------|---------|
| `scripts/download-legal-docs.py` | Download legal PDFs |
| `scripts/extract-legal-text.py` | Extract articles from PDFs |
| `scripts/ingest-to-database.py` | Ingest to Supabase with embeddings |
| `backend/data/legal_docs/*.pdf` | Downloaded legal codes (24.8 MB) |
| `backend/data/processed/*.json` | Extracted articles (5,320 total) |
| `.env` | Environment variables (Supabase, OpenAI) |
| `prisma/schema.prisma` | Database schema definition |

---

## 💰 Costs

- **OpenAI Embeddings:** ~$2-3 for 15,960 embeddings
- **Supabase:** Free tier (up to 500 MB database)
- **Total:** <$5

---

## 🎬 After Completion

Once ingestion completes, you will have:

- ✅ **5,320 legal articles** in your database
- ✅ **15,960 vector embeddings** for semantic search
- ✅ **RAG pipeline** returning accurate legal citations
- ✅ **Real Moroccan legal knowledge base** ready for users

**Your Mo7ami is now ready to become a national sensation! 🇲🇦🚀**

---

## 📞 Need Help?

Check these files for detailed info:
- `EXTRACTION_SUCCESS_REPORT.md` - Full extraction results
- `LEGAL_CONTENT_INGESTION_PROGRESS.md` - Detailed progress
- `SUPABASE_SETUP.md` - Supabase setup guide
- `NATIONAL_ROADMAP.md` - Strategic roadmap

---

**Ready to complete the final step? Set up Supabase and run the ingestion pipeline! 🚀**
