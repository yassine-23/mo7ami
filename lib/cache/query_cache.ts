/**
 * Query Caching Layer for Mo7ami
 * Multi-tier caching to reduce OpenAI API costs and improve response times
 */

import crypto from 'crypto';

export interface CacheConfig {
  embeddingTTL: number;    // 24 hours
  queryTTL: number;        // 1 hour
  enabled: boolean;
}

export interface CachedEmbedding {
  embedding: number[];
  timestamp: number;
}

export interface CachedAnswer {
  answer: string;
  citations: any[];
  timestamp: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  totalRequests: number;
}

/**
 * In-memory cache implementation
 * In production, replace with Redis for distributed caching
 */
class QueryCache {
  private embeddingCache: Map<string, CachedEmbedding>;
  private queryCache: Map<string, CachedAnswer>;

  private stats = {
    embedding: { hits: 0, misses: 0 },
    query: { hits: 0, misses: 0 },
  };

  private config: CacheConfig = {
    embeddingTTL: 24 * 60 * 60 * 1000,  // 24 hours
    queryTTL: 60 * 60 * 1000,           // 1 hour
    enabled: true,
  };

  constructor(config?: Partial<CacheConfig>) {
    this.embeddingCache = new Map();
    this.queryCache = new Map();

    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Periodic cleanup
    setInterval(() => this.cleanup(), 60 * 60 * 1000); // Every hour
  }

  /**
   * Generate cache key using SHA-256 hash
   */
  private generateKey(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  /**
   * Check if cached item is expired
   */
  private isExpired(timestamp: number, ttl: number): boolean {
    return Date.now() - timestamp > ttl;
  }

  /**
   * Get or generate embedding with caching
   */
  async getOrGenerateEmbedding(
    text: string,
    generator: () => Promise<number[]>
  ): Promise<number[]> {
    if (!this.config.enabled) {
      return await generator();
    }

    const cacheKey = this.generateKey(text);

    // Check cache
    const cached = this.embeddingCache.get(cacheKey);
    if (cached && !this.isExpired(cached.timestamp, this.config.embeddingTTL)) {
      this.stats.embedding.hits++;
      console.log(`[Cache] Embedding cache HIT: ${cacheKey.substring(0, 8)}...`);
      return cached.embedding;
    }

    // Cache miss - generate new embedding
    this.stats.embedding.misses++;
    console.log(`[Cache] Embedding cache MISS: ${cacheKey.substring(0, 8)}...`);

    const embedding = await generator();

    // Store in cache
    this.embeddingCache.set(cacheKey, {
      embedding,
      timestamp: Date.now(),
    });

    return embedding;
  }

  /**
   * Get or generate answer with caching
   */
  async getOrGenerateAnswer(
    query: string,
    language: string,
    generator: () => Promise<{ answer: string; citations: any[] }>
  ): Promise<{ answer: string; citations: any[] } | null> {
    if (!this.config.enabled) {
      return null; // Don't cache, generate fresh
    }

    const cacheKey = this.generateKey(`${query}:${language}`);

    // Check cache
    const cached = this.queryCache.get(cacheKey);
    if (cached && !this.isExpired(cached.timestamp, this.config.queryTTL)) {
      this.stats.query.hits++;
      console.log(`[Cache] Query cache HIT: "${query.substring(0, 30)}..."`);
      return {
        answer: cached.answer,
        citations: cached.citations,
      };
    }

    // Cache miss
    this.stats.query.misses++;
    return null;
  }

  /**
   * Store answer in cache
   */
  cacheAnswer(
    query: string,
    language: string,
    answer: string,
    citations: any[]
  ): void {
    if (!this.config.enabled) return;

    const cacheKey = this.generateKey(`${query}:${language}`);

    this.queryCache.set(cacheKey, {
      answer,
      citations,
      timestamp: Date.now(),
    });

    console.log(`[Cache] Cached answer for: "${query.substring(0, 30)}..."`);
  }

  /**
   * Clear expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    // Clean embedding cache
    for (const [key, value] of this.embeddingCache.entries()) {
      if (this.isExpired(value.timestamp, this.config.embeddingTTL)) {
        this.embeddingCache.delete(key);
      }
    }

    // Clean query cache
    for (const [key, value] of this.queryCache.entries()) {
      if (this.isExpired(value.timestamp, this.config.queryTTL)) {
        this.queryCache.delete(key);
      }
    }

    console.log(
      `[Cache] Cleanup complete. ` +
      `Embeddings: ${this.embeddingCache.size}, ` +
      `Queries: ${this.queryCache.size}`
    );
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    embedding: CacheStats;
    query: CacheStats;
    total: CacheStats;
  } {
    const embeddingTotal = this.stats.embedding.hits + this.stats.embedding.misses;
    const queryTotal = this.stats.query.hits + this.stats.query.misses;
    const grandTotal = embeddingTotal + queryTotal;

    return {
      embedding: {
        hits: this.stats.embedding.hits,
        misses: this.stats.embedding.misses,
        totalRequests: embeddingTotal,
        hitRate: embeddingTotal > 0
          ? (this.stats.embedding.hits / embeddingTotal) * 100
          : 0,
      },
      query: {
        hits: this.stats.query.hits,
        misses: this.stats.query.misses,
        totalRequests: queryTotal,
        hitRate: queryTotal > 0
          ? (this.stats.query.hits / queryTotal) * 100
          : 0,
      },
      total: {
        hits: this.stats.embedding.hits + this.stats.query.hits,
        misses: this.stats.embedding.misses + this.stats.query.misses,
        totalRequests: grandTotal,
        hitRate: grandTotal > 0
          ? ((this.stats.embedding.hits + this.stats.query.hits) / grandTotal) * 100
          : 0,
      },
    };
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.embeddingCache.clear();
    this.queryCache.clear();
    this.stats = {
      embedding: { hits: 0, misses: 0 },
      query: { hits: 0, misses: 0 },
    };
    console.log('[Cache] All caches cleared');
  }

  /**
   * Get cache sizes
   */
  getSizes(): { embeddings: number; queries: number } {
    return {
      embeddings: this.embeddingCache.size,
      queries: this.queryCache.size,
    };
  }
}

// Singleton instance
let cacheInstance: QueryCache | null = null;

/**
 * Get or create cache instance
 */
export function getQueryCache(config?: Partial<CacheConfig>): QueryCache {
  if (!cacheInstance) {
    cacheInstance = new QueryCache(config);
  }
  return cacheInstance;
}

/**
 * Redis-based cache implementation for production
 *
 * Installation:
 * ```bash
 * npm install redis
 * ```
 *
 * Usage:
 * ```typescript
 * import { createClient } from 'redis';
 *
 * const redisClient = createClient({
 *   url: process.env.REDIS_URL || 'redis://localhost:6379'
 * });
 *
 * await redisClient.connect();
 *
 * // Cache embedding
 * await redisClient.setEx(
 *   `embedding:${hash}`,
 *   24 * 60 * 60, // 24 hours
 *   JSON.stringify(embedding)
 * );
 *
 * // Get embedding
 * const cached = await redisClient.get(`embedding:${hash}`);
 * if (cached) {
 *   return JSON.parse(cached);
 * }
 * ```
 */
export class RedisQueryCache {
  // TODO: Implement Redis-based cache for production
  // This would replace the in-memory cache for distributed systems
}

/**
 * Cache middleware for Express/Next.js API routes
 */
export function withCache<T>(
  cacheKey: string,
  ttl: number,
  generator: () => Promise<T>
): Promise<T> {
  // Implementation for API route caching
  // This can wrap API handlers to add caching automatically
  return generator(); // Simplified for now
}

/**
 * Warmup cache with common queries
 */
export async function warmupCache(commonQueries: string[]): Promise<void> {
  const cache = getQueryCache();

  console.log(`[Cache] Warming up cache with ${commonQueries.length} queries...`);

  // This would pre-populate cache with common queries
  // Useful for production deployment

  // TODO: Implement cache warmup logic
}

/**
 * Export cache instance for use in other modules
 */
export default getQueryCache();
