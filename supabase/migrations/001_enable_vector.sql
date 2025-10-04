-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create index for vector similarity search (will be applied after schema is created)
-- This will be run in a separate migration after tables are created
