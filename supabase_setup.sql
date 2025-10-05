-- Mo7ami Database Setup for Supabase
-- Run this in Supabase SQL Editor

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create legal_documents table
CREATE TABLE IF NOT EXISTS legal_documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    title_ar TEXT,
    domain TEXT NOT NULL,
    language TEXT NOT NULL,
    official_ref TEXT NOT NULL,
    publication_date TIMESTAMP,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create document_chunks table with vector embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES legal_documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    language TEXT NOT NULL,
    article_number TEXT,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_document FOREIGN KEY (document_id) REFERENCES legal_documents(id)
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
ON document_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_language ON document_chunks(language);
CREATE INDEX IF NOT EXISTS idx_documents_domain ON legal_documents(domain);
CREATE INDEX IF NOT EXISTS idx_documents_language ON legal_documents(language);

-- Create vector search function
CREATE OR REPLACE FUNCTION search_similar_legal_chunks(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 10,
    filter_domain text DEFAULT NULL,
    filter_language text DEFAULT NULL
)
RETURNS TABLE (
    id text,
    document_id text,
    content text,
    language text,
    article_number text,
    similarity float,
    metadata jsonb
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
        1 - (dc.embedding <=> query_embedding) as similarity,
        dc.metadata
    FROM document_chunks dc
    JOIN legal_documents ld ON dc.document_id = ld.id
    WHERE
        (filter_domain IS NULL OR ld.domain = filter_domain)
        AND (filter_language IS NULL OR dc.language = filter_language)
        AND (1 - (dc.embedding <=> query_embedding)) > match_threshold
    ORDER BY dc.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create users table (for NextAuth)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE,
    email_verified TIMESTAMP,
    image TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create accounts table (for NextAuth OAuth)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, provider_account_id)
);

-- Create sessions table (for NextAuth)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    session_token TEXT UNIQUE NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMP NOT NULL
);

-- Grant permissions
GRANT ALL ON legal_documents TO postgres, service_role;
GRANT ALL ON document_chunks TO postgres, service_role;
GRANT ALL ON users TO postgres, service_role;
GRANT ALL ON accounts TO postgres, service_role;
GRANT ALL ON sessions TO postgres, service_role;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Mo7ami database setup complete!';
    RAISE NOTICE '📊 Tables created: legal_documents, document_chunks, users, accounts, sessions';
    RAISE NOTICE '🔍 Vector search enabled with pgvector';
    RAISE NOTICE '🚀 Ready for data ingestion!';
END $$;
