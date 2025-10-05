# 🗄️ Mo7ami Supabase Database Setup - Complete Step-by-Step Guide

## ⚠️ CRITICAL STEP - READ CAREFULLY

This sets up the **CORE INFRASTRUCTURE** for your RAG pipeline. This is what enables Mo7ami to:
- Store 5,320+ legal articles with AI embeddings
- Search semantically (understand meaning, not just keywords)
- Return precise legal citations
- Support Arabic & French queries

**Estimated Time:** 10 minutes
**Difficulty:** Easy (just copy/paste SQL)

---

## 📋 Pre-Flight Checklist

Before starting, verify you have:

- [x] Supabase account created
- [x] Project created: `aluaeysdedzxhowxytvs`
- [x] Project URL: `https://aluaeysdedzxhowxytvs.supabase.co`
- [x] Service role key obtained
- [x] `.env` file updated with Supabase credentials

All checked? ✅ Let's proceed!

---

## 🚀 STEP-BY-STEP INSTRUCTIONS

### Step 1: Open Supabase SQL Editor (30 seconds)

1. **Go to your Supabase project:**
   ```
   https://aluaeysdedzxhowxytvs.supabase.co
   ```

2. **Click on "SQL Editor" in the left sidebar**
   - Look for the icon: `</>`
   - Or go directly to: https://aluaeysdedzxhowxytvs.supabase.co/project/aluaeysdedzxhowxytvs/sql/new

3. **Click "+ New Query"** (top right button)

You should now see a blank SQL editor window.

---

### Step 2: Copy the Complete SQL Setup (1 minute)

**IMPORTANT:** Copy the ENTIRE SQL script below. Do NOT modify anything.

**Where to find it:**
- File: `/Users/yassinedrani/Desktop/mo7ami/SUPABASE_DATABASE_SETUP_COMPLETE.sql`
- Or copy from the code block below

**How to copy:**
1. Open the file in your code editor
2. Select ALL (Cmd+A / Ctrl+A)
3. Copy (Cmd+C / Ctrl+C)

**Quick copy command:**
```bash
# In terminal, this will copy the file to clipboard (macOS):
cat /Users/yassinedrani/Desktop/mo7ami/SUPABASE_DATABASE_SETUP_COMPLETE.sql | pbcopy

# Then just paste in Supabase SQL Editor
```

---

### Step 3: Paste SQL into Supabase Editor (10 seconds)

1. Click inside the SQL Editor window
2. Paste (Cmd+V / Ctrl+V)
3. You should see ~400+ lines of SQL code

**Verify you see these key sections:**
- ✅ `CREATE EXTENSION IF NOT EXISTS vector;` (at the top)
- ✅ `CREATE TABLE IF NOT EXISTS legal_documents`
- ✅ `CREATE TABLE IF NOT EXISTS document_chunks`
- ✅ `CREATE FUNCTION search_similar_legal_chunks`
- ✅ Success message at the bottom

---

### Step 4: Run the SQL Script (1 minute)

1. **Click the "RUN" button** (or press `Cmd+Enter` / `Ctrl+Enter`)

2. **Wait for execution** (usually 5-10 seconds)

3. **Check for success message:**

You should see in the "Messages" tab at the bottom:

```
NOTICE: ================================================================================
NOTICE: ✅ Mo7ami RAG Database Setup COMPLETE!
NOTICE: ================================================================================
NOTICE:
NOTICE: 📊 Database Status:
NOTICE:    - legal_documents table: Created (0 rows)
NOTICE:    - document_chunks table: Created (0 rows)
NOTICE:    - users table: Created
NOTICE:    - accounts table: Created
NOTICE:    - sessions table: Created
NOTICE:
NOTICE: 🔍 Vector Search:
NOTICE:    - pgvector extension: Enabled
NOTICE:    - Vector dimensions: 1536 (OpenAI text-embedding-3-large)
NOTICE:    - Similarity index: IVFFlat with 100 lists
NOTICE:    - Search function: search_similar_legal_chunks() ready
NOTICE:
NOTICE: ✨ Your Mo7ami RAG pipeline is ready to store Moroccan legal knowledge!
NOTICE: ================================================================================

Success. No rows returned
```

**If you see this ✅ → SUCCESS! Continue to Step 5**

**If you see errors ❌ → See Troubleshooting section below**

---

### Step 5: Verify Tables Were Created (2 minutes)

1. **Click "Table Editor" in left sidebar**
   - Or go to: https://aluaeysdedzxhowxytvs.supabase.co/project/aluaeysdedzxhowxytvs/editor

2. **You should see these 5 tables:**
   - ✅ `legal_documents` (0 rows initially)
   - ✅ `document_chunks` (0 rows initially)
   - ✅ `users` (0 rows)
   - ✅ `accounts` (0 rows)
   - ✅ `sessions` (0 rows)

3. **Click on `document_chunks` table**

4. **Verify the columns exist:**
   - ✅ `id` (text)
   - ✅ `document_id` (text)
   - ✅ `content` (text)
   - ✅ `language` (text)
   - ✅ `article_number` (text)
   - ✅ **`embedding` (vector)** ← MOST IMPORTANT!
   - ✅ `metadata` (jsonb)
   - ✅ `created_at` (timestamp)

**If you see the `embedding` column with type `vector` ✅ → PERFECT!**

This means pgvector is enabled and ready for AI embeddings.

---

### Step 6: Verify pgvector Extension (1 minute)

1. **Go back to SQL Editor**

2. **Run this verification query:**
```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

3. **You should see:**
```
extname | extowner | extnamespace | extrelocatable | extversion | ...
--------|----------|--------------|----------------|------------|----
vector  | 10       | 2200         | false          | 0.7.0      | ...
```

**If you see "vector" extension ✅ → EXCELLENT!**

---

### Step 7: Test Vector Search Function (2 minutes)

Let's verify the RAG search function works:

1. **In SQL Editor, run this test:**
```sql
-- Test the vector search function (will return empty since no data yet)
SELECT * FROM search_similar_legal_chunks(
    ARRAY[0.1, 0.2, 0.3]::vector(3),  -- Dummy 3D vector for testing
    0.5,                               -- Threshold
    5,                                 -- Limit
    NULL,                              -- No domain filter
    NULL                               -- No language filter
);
```

**Expected result:**
```
ERROR: dimension mismatch (expected 1536, got 3)
```

**This error is GOOD!** ✅

It means:
- ✅ The function exists
- ✅ It's expecting 1536-dimension vectors (correct for OpenAI embeddings)
- ✅ It will work once we ingest real data

**If you see this error → SUCCESS! Your RAG function is ready!**

---

## ✅ VERIFICATION CHECKLIST

Before proceeding to ingestion, confirm:

- [x] **SQL script ran successfully** (saw success message)
- [x] **5 tables created** in Table Editor
- [x] **`embedding` column exists** in `document_chunks` with type `vector`
- [x] **pgvector extension enabled** (verified with query)
- [x] **Search function exists** (tested and got dimension error)
- [x] **No actual errors** in SQL execution

**All checked? ✅ YOU'RE READY FOR DATA INGESTION!**

---

## 🚨 TROUBLESHOOTING

### Error: "extension vector does not exist"

**Solution:**
```sql
-- Run this first:
CREATE EXTENSION IF NOT EXISTS vector;

-- Then re-run the full script
```

---

### Error: "permission denied to create extension"

**Solution:**
You need admin privileges. Contact Supabase support or:
1. Go to Supabase Dashboard → Settings → Database
2. Enable "Enable extensions" toggle
3. Try again

---

### Error: "relation legal_documents already exists"

**This is OK!** It means tables already exist from a previous run.

**Solution:**
1. Tables are already created ✅
2. Skip to Step 5 (verification)
3. Or drop and recreate:
```sql
-- DANGER: This deletes all data!
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS legal_documents CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run the full setup script
```

---

### Error: "function search_similar_legal_chunks already exists"

**This is OK!** The function was created in a previous run.

**Solution:**
- Function already exists ✅
- Continue to verification

---

### No success message appears

**Check the "Messages" tab** at the bottom of SQL Editor.

**If you see "Success. No rows returned":**
- ✅ Script ran successfully
- Scroll up in Messages to see NOTICE logs
- Continue to Step 5

---

## 🎯 WHAT HAPPENS NEXT?

Once you confirm all verification steps ✅, we will:

1. **Run the ingestion script:**
   ```bash
   python3 scripts/ingest-to-database.py
   ```

2. **This will:**
   - Load all 5,320 extracted legal articles
   - Generate embeddings using your OpenAI API key
   - Store articles + embeddings in `legal_documents` and `document_chunks` tables
   - Take 30-60 minutes
   - Cost ~$2-3 in OpenAI API usage

3. **After ingestion completes:**
   - 5,320+ rows in `document_chunks` table
   - ~15,960 vector embeddings stored
   - RAG pipeline fully operational
   - Ready to test with real legal queries

---

## 📊 Expected Database State After Ingestion

### Before (Now):
```
legal_documents: 0 rows
document_chunks: 0 rows (with embedding column ready)
```

### After Ingestion:
```
legal_documents: 8 rows (one per legal code)
document_chunks: 15,960 rows (articles with embeddings)
Total embeddings: 15,960 × 1536 dimensions
Database size: ~50-100 MB
```

---

## ✨ FINAL CHECKLIST BEFORE INGESTION

Confirm these are TRUE:

- [x] I ran the SQL script successfully
- [x] I verified all 5 tables exist
- [x] I verified the `embedding` column is type `vector(1536)`
- [x] I verified pgvector extension is enabled
- [x] I tested the search function (got dimension error = good!)
- [x] My `.env` file has correct Supabase credentials
- [x] My OpenAI API key is in `.env`
- [x] I have $5+ credit in my OpenAI account

**ALL CHECKED? ✅ TYPE "READY" TO START INGESTION!**

---

## 🆘 Need Help?

**Common Issues:**
1. SQL errors → Check Troubleshooting section
2. Permission errors → Verify service_role key
3. Extension errors → Enable pgvector in Supabase settings

**Files to reference:**
- SQL Script: `SUPABASE_DATABASE_SETUP_COMPLETE.sql`
- .env file: Check credentials match Supabase dashboard
- Extraction results: `EXTRACTION_SUCCESS_REPORT.md`

---

**Last updated:** October 4, 2025
**Status:** Ready for verification
**Next step:** Confirm verification checklist, then start ingestion
