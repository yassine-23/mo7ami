-- Fix search function to match actual database schema
-- The actual schema uses snake_case columns: document_id, article_number
-- And does NOT have an is_active column

DROP FUNCTION IF EXISTS search_similar_legal_chunks(vector, float, int, text, text);

CREATE OR REPLACE FUNCTION search_similar_legal_chunks(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_domain text DEFAULT NULL,
  filter_language text DEFAULT NULL
)
RETURNS TABLE (
  id text,
  "documentId" text,
  content text,
  language text,
  "articleNumber" text,
  similarity float,
  metadata jsonb
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id as "documentId",
    dc.content,
    dc.language,
    dc.article_number as "articleNumber",
    (1 - (dc.embedding <=> query_embedding))::float as similarity,
    dc.metadata
  FROM document_chunks dc
  LEFT JOIN legal_documents ld ON dc.document_id = ld.id
  WHERE
    dc.embedding IS NOT NULL
    AND (1 - (dc.embedding <=> query_embedding)) >= match_threshold
    AND (filter_domain IS NULL OR ld.domain = filter_domain)
    AND (filter_language IS NULL OR dc.language = filter_language)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION search_similar_legal_chunks IS 'Search for similar legal document chunks using vector similarity. Works with actual snake_case schema.';
