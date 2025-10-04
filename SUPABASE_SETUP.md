# Supabase Setup Guide for Mo7ami

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: `mo7ami` or `mo7ami-legal-chatbot`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your target audience (e.g., `eu-central-1` for Europe/Morocco)
   - **Pricing Plan**: Start with Free tier (500 MB database, 2 GB bandwidth)

## Step 2: Enable pgvector Extension

Once your project is created:

1. Go to **Database** → **Extensions** in the Supabase dashboard
2. Search for `vector`
3. Enable the **`vector`** extension (for similarity search)
4. Click "Enable" - this adds pgvector support for embeddings

## Step 3: Get Connection Details

1. Go to **Settings** → **Database** in your Supabase project
2. Copy the following details:

### Connection String (for Prisma)
```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Direct Connection (for Prisma migrations)
```
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

### API Keys
- **Project URL**: `https://[YOUR-PROJECT-REF].supabase.co`
- **Anon/Public Key**: (for client-side queries)
- **Service Role Key**: (for server-side admin queries - keep secret!)

## Step 4: Update .env File

Add these to your `.env` file:

```bash
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"

# Supabase API (optional, for direct API access)
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 5: Update Prisma Schema

Update `prisma/schema.prisma` to use direct URL for migrations:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Add this line
  extensions = [vector]
}
```

## Step 6: Run Migrations

After updating .env and schema:

```bash
# Generate Prisma client
npx prisma generate

# Push schema to Supabase (first time)
npx prisma db push

# Or run migrations (for production)
npx prisma migrate dev --name init
```

## Step 7: Enable Vector Similarity Search Index

Run this SQL in Supabase SQL Editor to create vector index:

```sql
-- Create IVFFlat index for faster similarity search
CREATE INDEX document_chunks_embedding_idx
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create function for similarity search
CREATE OR REPLACE FUNCTION search_similar_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  FROM document_chunks
  WHERE 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
```

## Step 8: Install Supabase Client (Optional)

If you want to use Supabase client library:

```bash
npm install @supabase/supabase-js
```

## Supabase Features for Mo7ami

### ✅ What Supabase Provides:
- **PostgreSQL Database**: Fully managed with automatic backups
- **pgvector Extension**: Vector similarity search for RAG
- **Real-time Subscriptions**: Live updates for chat
- **Authentication**: Built-in auth (can integrate with NextAuth)
- **Storage**: File storage for documents (if needed)
- **Edge Functions**: Serverless functions (alternative to backend)
- **Dashboard**: SQL editor, table editor, logs

### 📊 Free Tier Limits:
- 500 MB database size
- 2 GB bandwidth per month
- 1 GB file storage
- 50,000 monthly active users
- 2 million Edge Function invocations

### 🚀 Benefits for Mo7ami:
1. **No server management** - Fully managed PostgreSQL
2. **Built-in pgvector** - Perfect for RAG implementation
3. **Free SSL** - Secure connections included
4. **Automatic backups** - Daily backups on paid plans
5. **Global CDN** - Fast access from Morocco/worldwide
6. **Real-time** - Live chat updates if needed

## Next Steps

After Supabase is set up:
1. ✅ Run Prisma migrations
2. ✅ Seed legal documents into database
3. ✅ Generate embeddings for RAG
4. ✅ Build RAG retrieval service
5. ✅ Connect frontend to database

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Prisma with Supabase: https://www.prisma.io/docs/guides/database/supabase
- pgvector Guide: https://supabase.com/docs/guides/ai/vector-columns
