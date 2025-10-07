/**
 * Hybrid Search Implementation for Mo7ami
 * Combines vector similarity search with BM25 keyword matching
 * Uses Reciprocal Rank Fusion (RRF) for optimal result ranking
 */

import { generateEmbedding } from './embeddings';
import { getServiceSupabase } from '../supabase/client';
import type { RetrievedChunk } from './retrieval';

export interface HybridSearchOptions {
  vectorWeight?: number;      // Default: 0.6 (60% vector, 40% BM25)
  bm25Weight?: number;         // Default: 0.4
  matchThreshold?: number;     // Default: 0.30
  matchCount?: number;         // Default: 10
  filterDomain?: string;
  filterLanguage?: string;
}

interface SearchResult {
  id: string;
  documentId: string;
  content: string;
  language: string;
  articleNumber: string | null;
  metadata: any;
  score: number;
  rank: number;
}

/**
 * Hybrid search combining vector similarity and keyword matching
 */
export async function hybridSearch(
  query: string,
  options: HybridSearchOptions = {}
): Promise<RetrievedChunk[]> {
  const {
    vectorWeight = 0.6,
    bm25Weight = 0.4,
    matchThreshold = 0.30,
    matchCount = 10,
    filterDomain,
    filterLanguage,
  } = options;

  console.log(`[Hybrid Search] Query: "${query.substring(0, 50)}..."`);
  console.log(`[Hybrid Search] Weights: vector=${vectorWeight}, bm25=${bm25Weight}`);

  try {
    // 1. Vector Search
    const vectorResults = await vectorSearch(
      query,
      matchCount * 2,
      filterDomain,
      filterLanguage
    );
    console.log(`[Hybrid Search] Vector results: ${vectorResults.length}`);

    // 2. BM25 Keyword Search
    const bm25Results = await bm25Search(
      query,
      matchCount * 2,
      filterDomain,
      filterLanguage
    );
    console.log(`[Hybrid Search] BM25 results: ${bm25Results.length}`);

    // 3. Reciprocal Rank Fusion
    const fusedResults = reciprocalRankFusion(
      vectorResults,
      bm25Results,
      vectorWeight,
      bm25Weight
    );

    // 4. Filter by threshold and return top K
    const finalResults = fusedResults
      .filter(r => r.score >= matchThreshold)
      .slice(0, matchCount);

    console.log(
      `[Hybrid Search] Final results: ${finalResults.length} ` +
      `(threshold: ${matchThreshold})`
    );

    // Convert to RetrievedChunk format
    return finalResults.map(r => ({
      id: r.id,
      documentId: r.documentId,
      content: r.content,
      language: r.language,
      articleNumber: r.articleNumber,
      similarity: r.score,
      metadata: r.metadata,
    }));
  } catch (error) {
    console.error('[Hybrid Search] Error:', error);
    throw new Error('Hybrid search failed');
  }
}

/**
 * Vector similarity search using OpenAI embeddings
 */
async function vectorSearch(
  query: string,
  limit: number,
  filterDomain?: string,
  filterLanguage?: string
): Promise<SearchResult[]> {
  // Generate query embedding
  const { embedding } = await generateEmbedding(query);

  const supabase = getServiceSupabase();

  // Call Supabase function for vector similarity
  const { data, error } = await supabase.rpc('search_similar_legal_chunks', {
    query_embedding: embedding,
    match_threshold: 0.1,  // Lower threshold for fusion
    match_count: limit,
    filter_domain: filterDomain || null,
    filter_language: filterLanguage || null,
  });

  if (error) {
    console.error('Vector search error:', error);
    return [];
  }

  return (data || []).map((row: any, index: number) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    language: row.language,
    articleNumber: row.article_number,
    metadata: row.metadata,
    score: row.similarity || 0,
    rank: index + 1,
  }));
}

/**
 * BM25 keyword search using PostgreSQL full-text search
 */
async function bm25Search(
  query: string,
  limit: number,
  filterDomain?: string,
  filterLanguage?: string
): Promise<SearchResult[]> {
  const supabase = getServiceSupabase();

  // Use PostgreSQL full-text search with BM25-like ranking
  // This requires a database function (see migration SQL below)
  const { data, error } = await supabase.rpc('bm25_search_legal_chunks', {
    search_query: query,
    match_limit: limit,
    filter_domain: filterDomain || null,
    filter_language: filterLanguage || null,
  });

  if (error) {
    console.warn('BM25 search not available, using fallback:', error.message);
    // Fallback to simple keyword search if BM25 function doesn't exist
    return await fallbackKeywordSearch(query, limit, filterDomain, filterLanguage);
  }

  return (data || []).map((row: any, index: number) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    language: row.language,
    articleNumber: row.article_number,
    metadata: row.metadata,
    score: row.bm25_score || 0,
    rank: index + 1,
  }));
}

/**
 * Fallback keyword search using simple text matching
 */
async function fallbackKeywordSearch(
  query: string,
  limit: number,
  filterDomain?: string,
  filterLanguage?: string
): Promise<SearchResult[]> {
  const supabase = getServiceSupabase();

  // Simple keyword matching as fallback
  let queryBuilder = supabase
    .from('document_chunks')
    .select('id, document_id, content, language, article_number, metadata')
    .ilike('content', `%${query}%`)
    .limit(limit);

  if (filterDomain) {
    queryBuilder = queryBuilder.eq('domain', filterDomain);
  }

  if (filterLanguage) {
    queryBuilder = queryBuilder.eq('language', filterLanguage);
  }

  const { data, error } = await queryBuilder;

  if (error) {
    console.error('Fallback keyword search error:', error);
    return [];
  }

  return (data || []).map((row: any, index: number) => ({
    id: row.id,
    documentId: row.document_id,
    content: row.content,
    language: row.language,
    articleNumber: row.article_number,
    metadata: row.metadata,
    score: 0.5,  // Fixed score for fallback
    rank: index + 1,
  }));
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Combines multiple ranked lists using reciprocal rank scoring
 *
 * RRF Score = Σ (weight / (k + rank))
 * where k=60 is a constant that reduces impact of high-rank differences
 */
function reciprocalRankFusion(
  vectorResults: SearchResult[],
  bm25Results: SearchResult[],
  vectorWeight: number,
  bm25Weight: number
): SearchResult[] {
  const k = 60; // RRF constant (standard value)
  const scoreMap = new Map<string, number>();
  const resultMap = new Map<string, SearchResult>();

  // Score from vector search (rank-based)
  vectorResults.forEach((result, index) => {
    const rank = index + 1;
    const rrfScore = vectorWeight / (k + rank);

    scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + rrfScore);
    resultMap.set(result.id, result);
  });

  // Score from BM25 search (rank-based)
  bm25Results.forEach((result, index) => {
    const rank = index + 1;
    const rrfScore = bm25Weight / (k + rank);

    scoreMap.set(result.id, (scoreMap.get(result.id) || 0) + rrfScore);

    // Store result if not already stored
    if (!resultMap.has(result.id)) {
      resultMap.set(result.id, result);
    }
  });

  // Combine all unique results with their RRF scores
  const fusedResults = Array.from(resultMap.values()).map(result => ({
    ...result,
    score: scoreMap.get(result.id) || 0,
  }));

  // Sort by RRF score (descending)
  fusedResults.sort((a, b) => b.score - a.score);

  return fusedResults;
}

/**
 * Query expansion using semantic variations
 * Helps improve recall by generating alternative phrasings
 */
export async function expandQuery(query: string): Promise<string[]> {
  // For now, return original query
  // In production, use GPT-4o-mini to generate alternatives
  // See backend/app/services/query_expansion.py for implementation
  return [query];
}

/**
 * Database migration SQL for BM25 search
 *
 * Run this migration to enable BM25 keyword search:
 *
 * ```sql
 * -- Create BM25 search function
 * CREATE OR REPLACE FUNCTION bm25_search_legal_chunks(
 *   search_query TEXT,
 *   match_limit INT DEFAULT 10,
 *   filter_domain TEXT DEFAULT NULL,
 *   filter_language TEXT DEFAULT NULL
 * )
 * RETURNS TABLE (
 *   id UUID,
 *   document_id UUID,
 *   content TEXT,
 *   language TEXT,
 *   article_number TEXT,
 *   metadata JSONB,
 *   bm25_score FLOAT
 * )
 * LANGUAGE plpgsql
 * AS $$
 * BEGIN
 *   RETURN QUERY
 *   SELECT
 *     dc.id,
 *     dc.document_id,
 *     dc.content,
 *     dc.language,
 *     dc.article_number,
 *     dc.metadata,
 *     ts_rank_cd(
 *       to_tsvector('arabic', dc.content),
 *       plainto_tsquery('arabic', search_query),
 *       32  -- BM25-like ranking
 *     ) AS bm25_score
 *   FROM document_chunks dc
 *   WHERE
 *     to_tsvector('arabic', dc.content) @@ plainto_tsquery('arabic', search_query)
 *     AND (filter_domain IS NULL OR dc.domain = filter_domain)
 *     AND (filter_language IS NULL OR dc.language = filter_language)
 *   ORDER BY bm25_score DESC
 *   LIMIT match_limit;
 * END;
 * $$;
 * ```
 */
