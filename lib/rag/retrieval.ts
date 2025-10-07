/**
 * Document Retrieval Service for Mo7ami RAG Pipeline
 * Retrieves relevant legal documents using vector similarity search
 */

import { getServiceSupabase } from '../supabase/client';
import { generateEmbedding } from './embeddings';
import { detectLanguage } from '../utils/language';

export interface RetrievedChunk {
  id: string;
  documentId: string;
  content: string;
  language: string;
  articleNumber: string | null;
  similarity: number;
  metadata: any;
}

export interface RetrievalOptions {
  matchThreshold?: number;
  matchCount?: number;
  filterDomain?: string;
  filterLanguage?: string;
}

/**
 * Retrieve relevant legal document chunks using vector similarity search
 */
export async function retrieveRelevantChunks(
  query: string,
  options: RetrievalOptions = {}
): Promise<RetrievedChunk[]> {
  const {
    matchThreshold = 0.30,  // Increased for quality matching (was 0.05)
    matchCount = 10,
    filterDomain,
    filterLanguage,
  } = options;

  try {
    // Generate embedding for the query
    const { embedding } = await generateEmbedding(query);

    // DON'T filter by language for cross-lingual search
    // Documents are in French but queries can be in Arabic
    // OpenAI embeddings are multilingual and will find matches across languages

    // Call Supabase function for similarity search
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('search_similar_legal_chunks', {
      query_embedding: embedding,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_domain: filterDomain || null,
      filter_language: null,  // Allow cross-lingual matching
    });

    if (error) {
      console.error('Error retrieving chunks:', error);
      throw new Error('Failed to retrieve relevant documents');
    }

    return data || [];
  } catch (error) {
    console.error('Error in retrieveRelevantChunks:', error);
    throw error;
  }
}

/**
 * Get legal document by official reference
 */
export async function getLegalDocumentByRef(officialRef: string) {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('get_legal_document_by_ref', {
      official_reference: officialRef,
    });

    if (error) {
      console.error('Error fetching document by ref:', error);
      throw new Error('Failed to fetch legal document');
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in getLegalDocumentByRef:', error);
    throw error;
  }
}

/**
 * Search documents by legal domain
 */
export async function searchDocumentsByDomain(
  domain: string,
  language: string = 'ar'
) {
  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.rpc('search_documents_by_domain', {
      search_domain: domain,
      search_language: language,
    });

    if (error) {
      console.error('Error searching documents by domain:', error);
      throw new Error('Failed to search documents');
    }

    return data || [];
  } catch (error) {
    console.error('Error in searchDocumentsByDomain:', error);
    throw error;
  }
}

/**
 * Detect legal domain from query
 * This is a simple keyword-based detector
 * Can be enhanced with ML classification later
 */
export function detectLegalDomain(query: string): string | undefined {
  // Domain names must match database values: penal_law, civil_law, etc.
  const domainKeywords: Record<string, string[]> = {
    penal_law: ['سرقة', 'جريمة', 'عقوبة', 'قتل', 'سجن', 'vol', 'crime', 'peine', 'prison', 'pénal'],
    civil_law: ['عقد', 'التزام', 'دين', 'contrat', 'obligation', 'dette', 'civil'],
    family_law: ['طلاق', 'زواج', 'حضانة', 'إرث', 'مودونة', 'divorce', 'mariage', 'garde', 'héritage', 'moudawana'],
    labor_law: ['عمل', 'أجير', 'شغل', 'travail', 'salarié', 'employé', 'licenciement'],
    commercial_law: ['شركة', 'تجارة', 'إفلاس', 'société', 'commerce', 'faillite'],
    real_estate: ['عقار', 'ملكية', 'كراء', 'immobilier', 'propriété', 'bail'],
    tax_law: ['ضريبة', 'ضرائب', 'impôt', 'taxe', 'fiscal'],
    consumer: ['مستهلك', 'ضمان', 'consommateur', 'garantie', 'protection'],
  };

  const lowerQuery = query.toLowerCase();

  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(keyword => lowerQuery.includes(keyword))) {
      return domain;
    }
  }

  return undefined;
}
