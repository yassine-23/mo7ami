-- ================================================================================
-- Mo7ami Legal RAG Database Setup
-- Complete Supabase Database Schema with pgvector for AI-Powered Legal Search
-- ================================================================================
--
-- IMPORTANT: This SQL sets up the CORE INFRASTRUCTURE for your RAG pipeline
--
-- What this does:
-- 1. Enables pgvector extension for AI semantic search
-- 2. Creates tables to store 5,320+ legal articles
-- 3. Creates vector embeddings storage (1536 dimensions from OpenAI)
-- 4. Creates optimized indexes for fast similarity search
-- 5. Creates search function for RAG retrieval
-- 6. Sets up authentication tables for NextAuth
--
-- After running this, your Mo7ami will be able to:
-- - Store all Moroccan legal codes with embeddings
-- - Search legal articles semantically (not just keywords)
-- - Return precise citations with article numbers
-- - Support Arabic and French queries
-- ================================================================================

-- ============================================================================
-- STEP 1: Enable pgvector Extension (CRITICAL for AI embeddings)
-- ============================================================================
-- This enables vector similarity search - the foundation of RAG
CREATE EXTENSION IF NOT EXISTS vector;


-- ============================================================================
-- STEP 2: Create Legal Documents Table (Main legal codes storage)
-- ============================================================================
-- Stores metadata for each legal code (Moudawana, Code Pénal, etc.)
CREATE TABLE IF NOT EXISTS legal_documents (
    id TEXT PRIMARY KEY,                    -- Unique ID for each legal code
    title TEXT NOT NULL,                    -- French title (e.g., "Code de la Famille")
    title_ar TEXT,                          -- Arabic title (e.g., "مدونة الأسرة")
    domain TEXT NOT NULL,                   -- Legal domain (family_law, penal_law, etc.)
    language TEXT NOT NULL,                 -- Primary language (fr, ar)
    official_ref TEXT NOT NULL,             -- Official reference (Dahir number, BO reference)
    publication_date TIMESTAMP,             -- When the law was published
    content TEXT,                           -- Full text preview
    metadata JSONB DEFAULT '{}',            -- Extra metadata (JSON format)
    created_at TIMESTAMP DEFAULT NOW(),     -- When added to database
    updated_at TIMESTAMP DEFAULT NOW()      -- Last update timestamp
);

-- Create index for faster queries by domain
CREATE INDEX IF NOT EXISTS idx_documents_domain ON legal_documents(domain);

-- Create index for faster queries by language
CREATE INDEX IF NOT EXISTS idx_documents_language ON legal_documents(language);


-- ============================================================================
-- STEP 3: Create Document Chunks Table (Individual article storage with AI)
-- ============================================================================
-- This is THE MOST IMPORTANT TABLE - stores individual legal articles with embeddings
-- Each article is chunked and stored with its OpenAI vector embedding
CREATE TABLE IF NOT EXISTS document_chunks (
    id TEXT PRIMARY KEY,                    -- Unique chunk ID
    document_id TEXT NOT NULL,              -- Foreign key to legal_documents
    content TEXT NOT NULL,                  -- The actual article text content
    language TEXT NOT NULL,                 -- Language of this chunk (fr, ar)
    article_number TEXT,                    -- Article number (e.g., "Article 123", "المادة 123")
    embedding vector(1536),                 -- 🔥 OpenAI embedding (1536 dimensions)
    metadata JSONB DEFAULT '{}',            -- Extra data (title, page, etc.)
    created_at TIMESTAMP DEFAULT NOW(),     -- When created

    -- Foreign key constraint to ensure data integrity
    CONSTRAINT fk_document
        FOREIGN KEY (document_id)
        REFERENCES legal_documents(id)
        ON DELETE CASCADE                   -- Delete chunks if parent document deleted
);

-- Create index for faster lookups by document
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);

-- Create index for faster language filtering
CREATE INDEX IF NOT EXISTS idx_chunks_language ON document_chunks(language);

-- Create index for article number lookups
CREATE INDEX IF NOT EXISTS idx_chunks_article_number ON document_chunks(article_number);


-- ============================================================================
-- STEP 4: Create Vector Similarity Index (CRITICAL for fast RAG search)
-- ============================================================================
-- This index enables FAST vector similarity search
-- Uses IVFFlat algorithm optimized for cosine similarity
-- Without this, searches would be SLOW on 15,000+ embeddings
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- NOTE: "lists = 100" means 100 clusters for the index
-- Optimal for 10,000-100,000 vectors
-- Tradeoff: Speed vs Accuracy (100 is good balance)


-- ============================================================================
-- STEP 5: Create Vector Search Function (RAG Retrieval Function)
-- ============================================================================
-- This is the CORE FUNCTION your RAG pipeline will call
-- It finds the most similar legal articles to a user's query
--
-- How it works:
-- 1. Takes user query embedding (from OpenAI)
-- 2. Compares to all article embeddings using cosine similarity
-- 3. Returns top N most relevant articles with citations
-- 4. Can filter by domain (e.g., only family law) and language
--
CREATE OR REPLACE FUNCTION search_similar_legal_chunks(
    query_embedding vector(1536),           -- User query embedding from OpenAI
    match_threshold float DEFAULT 0.7,      -- Minimum similarity (0-1, higher = stricter)
    match_count int DEFAULT 10,             -- How many results to return
    filter_domain text DEFAULT NULL,        -- Optional: filter by legal domain
    filter_language text DEFAULT NULL       -- Optional: filter by language (ar/fr)
)
RETURNS TABLE (
    id text,                                -- Chunk ID
    document_id text,                       -- Parent document ID
    content text,                           -- Article text
    language text,                          -- Language
    article_number text,                    -- Article number for citation
    similarity float,                       -- Similarity score (0-1)
    metadata jsonb                          -- Extra metadata
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dc.id,
        dc.document_id,
        dc.content,
        dc.language,
        dc.article_number,
        -- Calculate similarity (1 - cosine distance = cosine similarity)
        1 - (dc.embedding <=> query_embedding) as similarity,
        dc.metadata
    FROM document_chunks dc
    JOIN legal_documents ld ON dc.document_id = ld.id
    WHERE
        -- Apply filters if provided
        (filter_domain IS NULL OR ld.domain = filter_domain)
        AND (filter_language IS NULL OR dc.language = filter_language)
        -- Only return results above similarity threshold
        AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
    -- Order by most similar first (lowest cosine distance)
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;


-- ============================================================================
-- STEP 6: Create Users Table (NextAuth Authentication)
-- ============================================================================
-- Stores user accounts for Google OAuth login
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);


-- ============================================================================
-- STEP 7: Create Accounts Table (OAuth Providers - NextAuth)
-- ============================================================================
-- Links users to their OAuth providers (Google, etc.)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,                     -- oauth, email, etc.
    provider TEXT NOT NULL,                 -- google, credentials, etc.
    provider_account_id TEXT NOT NULL,      -- User's ID at the provider
    refresh_token TEXT,                     -- OAuth refresh token
    access_token TEXT,                      -- OAuth access token
    expires_at BIGINT,                      -- Token expiration
    token_type TEXT,                        -- Bearer, etc.
    scope TEXT,                             -- OAuth scopes
    id_token TEXT,                          -- OpenID Connect ID token
    session_state TEXT,

    -- Foreign key to users table
    CONSTRAINT fk_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    -- Ensure one account per provider per user
    UNIQUE(provider, provider_account_id)
);

-- Index for faster lookups during authentication
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);


-- ============================================================================
-- STEP 8: Create Sessions Table (NextAuth Session Management)
-- ============================================================================
-- Stores active user sessions
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,     -- Session cookie token
    user_id TEXT NOT NULL,
    expires TIMESTAMP NOT NULL,             -- Session expiration

    -- Foreign key to users
    CONSTRAINT fk_session_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- Index for fast session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);


-- ============================================================================
-- STEP 9: Grant Permissions (Security)
-- ============================================================================
-- Ensure service_role can read/write all tables
GRANT ALL ON legal_documents TO postgres, service_role, anon;
GRANT ALL ON document_chunks TO postgres, service_role, anon;
GRANT ALL ON users TO postgres, service_role, anon;
GRANT ALL ON accounts TO postgres, service_role, anon;
GRANT ALL ON sessions TO postgres, service_role, anon;


-- ============================================================================
-- STEP 10: Success Verification
-- ============================================================================
-- This will print success messages in the Supabase SQL Editor
DO $$
DECLARE
    doc_count INTEGER;
    chunk_count INTEGER;
BEGIN
    -- Count existing records (will be 0 initially)
    SELECT COUNT(*) INTO doc_count FROM legal_documents;
    SELECT COUNT(*) INTO chunk_count FROM document_chunks;

    -- Print success messages
    RAISE NOTICE '';
    RAISE NOTICE '================================================================================';
    RAISE NOTICE '✅ Mo7ami RAG Database Setup COMPLETE!';
    RAISE NOTICE '================================================================================';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Database Status:';
    RAISE NOTICE '   - legal_documents table: Created (% rows)', doc_count;
    RAISE NOTICE '   - document_chunks table: Created (% rows)', chunk_count;
    RAISE NOTICE '   - users table: Created';
    RAISE NOTICE '   - accounts table: Created';
    RAISE NOTICE '   - sessions table: Created';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 Vector Search:';
    RAISE NOTICE '   - pgvector extension: Enabled';
    RAISE NOTICE '   - Vector dimensions: 1536 (OpenAI text-embedding-3-large)';
    RAISE NOTICE '   - Similarity index: IVFFlat with 100 lists';
    RAISE NOTICE '   - Search function: search_similar_legal_chunks() ready';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Next Steps:';
    RAISE NOTICE '   1. Verify tables in Supabase Dashboard → Table Editor';
    RAISE NOTICE '   2. Run: python3 scripts/ingest-to-database.py';
    RAISE NOTICE '   3. Ingest 5,320 legal articles with embeddings';
    RAISE NOTICE '';
    RAISE NOTICE '✨ Your Mo7ami RAG pipeline is ready to store Moroccan legal knowledge!';
    RAISE NOTICE '================================================================================';
    RAISE NOTICE '';
END $$;


-- ============================================================================
-- VERIFICATION QUERIES (Optional - run these to verify setup)
-- ============================================================================
-- Uncomment and run these one by one to verify everything works:

-- Check if pgvector is enabled:
-- SELECT * FROM pg_extension WHERE extname = 'vector';

-- List all tables created:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public';

-- Check vector search function exists:
-- SELECT proname FROM pg_proc WHERE proname = 'search_similar_legal_chunks';

-- ============================================================================
-- END OF SETUP
-- ============================================================================
