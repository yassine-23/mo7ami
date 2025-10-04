-- Function for similarity search on document chunks
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
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc."documentId" as document_id,
    dc.content,
    dc.language,
    dc."articleNumber" as article_number,
    1 - (dc.embedding <=> query_embedding) as similarity,
    dc.metadata
  FROM document_chunks dc
  LEFT JOIN legal_documents ld ON dc."documentId" = ld.id
  WHERE
    (dc.embedding IS NOT NULL)
    AND (1 - (dc.embedding <=> query_embedding) > match_threshold)
    AND (filter_domain IS NULL OR ld.domain = filter_domain)
    AND (filter_language IS NULL OR dc.language = filter_language)
    AND (ld."isActive" = true)
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Function to get legal document by official reference
CREATE OR REPLACE FUNCTION get_legal_document_by_ref(
  official_reference text
)
RETURNS TABLE (
  id text,
  title text,
  domain text,
  official_ref text,
  publication_date timestamp with time zone,
  language text,
  content_ar text,
  content_fr text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    title,
    domain,
    "officialRef" as official_ref,
    "publicationDate" as publication_date,
    language,
    "contentAr" as content_ar,
    "contentFr" as content_fr
  FROM legal_documents
  WHERE "officialRef" = official_reference
  AND "isActive" = true
  LIMIT 1;
$$;

-- Function to search documents by domain and language
CREATE OR REPLACE FUNCTION search_documents_by_domain(
  search_domain text,
  search_language text DEFAULT 'ar'
)
RETURNS TABLE (
  id text,
  title text,
  official_ref text,
  publication_date timestamp with time zone,
  document_type text
)
LANGUAGE sql STABLE
AS $$
  SELECT
    id,
    title,
    "officialRef" as official_ref,
    "publicationDate" as publication_date,
    "documentType" as document_type
  FROM legal_documents
  WHERE domain = search_domain
  AND language = search_language
  AND "isActive" = true
  ORDER BY "publicationDate" DESC;
$$;

-- Analytics function to get query statistics
CREATE OR REPLACE FUNCTION get_query_statistics(
  days_back int DEFAULT 30
)
RETURNS TABLE (
  total_queries bigint,
  successful_queries bigint,
  voice_queries bigint,
  avg_response_time float,
  top_domains jsonb
)
LANGUAGE plpgsql STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::bigint as total_queries,
    COUNT(*) FILTER (WHERE successful = true)::bigint as successful_queries,
    COUNT(*) FILTER (WHERE "voiceUsed" = true)::bigint as voice_queries,
    AVG("responseTime")::float as avg_response_time,
    jsonb_agg(
      jsonb_build_object('domain', domain, 'count', count)
      ORDER BY count DESC
    ) FILTER (WHERE domain IS NOT NULL) as top_domains
  FROM (
    SELECT
      successful,
      "voiceUsed",
      "responseTime",
      domain,
      COUNT(*) as count
    FROM query_analytics
    WHERE "createdAt" >= NOW() - (days_back || ' days')::interval
    GROUP BY successful, "voiceUsed", "responseTime", domain
  ) subquery;
END;
$$;
