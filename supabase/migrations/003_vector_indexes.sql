-- Create IVFFlat index for vector similarity search
-- This significantly speeds up nearest neighbor searches
-- lists = sqrt(total_rows) is a good starting point
-- Adjust based on your data size

-- Index for Arabic document chunks
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Additional indexes for faster filtering
CREATE INDEX IF NOT EXISTS document_chunks_language_idx
ON document_chunks (language);

CREATE INDEX IF NOT EXISTS document_chunks_document_id_idx
ON document_chunks ("documentId");

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS legal_documents_domain_active_idx
ON legal_documents (domain, "isActive")
WHERE "isActive" = true;

CREATE INDEX IF NOT EXISTS legal_documents_language_idx
ON legal_documents (language);

-- Conversation history indexes
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
ON messages ("conversationId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS conversations_user_created_idx
ON conversations ("userId", "createdAt" DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS query_analytics_created_domain_idx
ON query_analytics ("createdAt" DESC, domain);

CREATE INDEX IF NOT EXISTS feedback_message_idx
ON feedback ("messageId");

-- Comment explaining the vector index configuration
COMMENT ON INDEX document_chunks_embedding_idx IS
'IVFFlat index for fast vector similarity search.
Uses cosine distance for measuring similarity between embeddings.
Adjust lists parameter based on dataset size: lists ≈ sqrt(total_rows)';
