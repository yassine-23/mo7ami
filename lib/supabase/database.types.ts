/**
 * Supabase Database Types for Mo7ami
 *
 * These types match the Prisma schema
 */

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string | null;
          email: string | null;
          emailVerified: Date | null;
          image: string | null;
          createdAt: Date;
          updatedAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          userId: string | null;
          title: string | null;
          language: string;
          createdAt: Date;
          updatedAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversationId: string;
          role: string;
          content: string;
          language: string;
          citations: any | null;
          voiceUsed: boolean;
          createdAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'createdAt'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      legal_documents: {
        Row: {
          id: string;
          title: string;
          titleAr: string | null;
          titleFr: string | null;
          domain: string;
          documentType: string;
          officialRef: string;
          publicationDate: Date | null;
          language: string;
          content: string;
          contentAr: string | null;
          contentFr: string | null;
          metadata: any | null;
          isActive: boolean;
          createdAt: Date;
          updatedAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['legal_documents']['Row'], 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Database['public']['Tables']['legal_documents']['Insert']>;
      };
      document_chunks: {
        Row: {
          id: string;
          documentId: string;
          chunkIndex: number;
          content: string;
          language: string;
          embedding: number[] | null;
          articleNumber: string | null;
          metadata: any | null;
          createdAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['document_chunks']['Row'], 'id' | 'createdAt'>;
        Update: Partial<Database['public']['Tables']['document_chunks']['Insert']>;
      };
      query_analytics: {
        Row: {
          id: string;
          query: string;
          language: string;
          domain: string | null;
          responseTime: number;
          voiceUsed: boolean;
          successful: boolean;
          createdAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['query_analytics']['Row'], 'id' | 'createdAt'>;
        Update: Partial<Database['public']['Tables']['query_analytics']['Insert']>;
      };
      feedback: {
        Row: {
          id: string;
          messageId: string;
          userId: string | null;
          rating: number;
          comment: string | null;
          issueType: string | null;
          createdAt: Date;
        };
        Insert: Omit<Database['public']['Tables']['feedback']['Row'], 'id' | 'createdAt'>;
        Update: Partial<Database['public']['Tables']['feedback']['Insert']>;
      };
    };
    Functions: {
      search_similar_legal_chunks: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
          filter_domain?: string;
          filter_language?: string;
        };
        Returns: {
          id: string;
          document_id: string;
          content: string;
          language: string;
          article_number: string;
          similarity: number;
          metadata: any;
        }[];
      };
      get_legal_document_by_ref: {
        Args: {
          official_reference: string;
        };
        Returns: {
          id: string;
          title: string;
          domain: string;
          official_ref: string;
          publication_date: Date;
          language: string;
          content_ar: string;
          content_fr: string;
        }[];
      };
      search_documents_by_domain: {
        Args: {
          search_domain: string;
          search_language?: string;
        };
        Returns: {
          id: string;
          title: string;
          official_ref: string;
          publication_date: Date;
          document_type: string;
        }[];
      };
      get_query_statistics: {
        Args: {
          days_back?: number;
        };
        Returns: {
          total_queries: number;
          successful_queries: number;
          voice_queries: number;
          avg_response_time: number;
          top_domains: any;
        }[];
      };
    };
  };
}
