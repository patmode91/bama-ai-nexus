import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiCache } from '../cache/advancedCacheService'; // Import advanced AI cache

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_AI_API_KEY);

interface SearchResult {
  id: string;
  business_id: number;
  name: string;
  description: string;
  similarity: number;
  metadata?: Record<string, any>;
}

interface EmbeddingResponse {
  embedding: {
    values: number[];
  };
}

export class SemanticSearchEngine {
  private model: any;
  // private cache: Map<string, SearchResult[]> = new Map(); // Replaced with aiCache

  constructor() {
    // Utilizing 'text-embedding-004', a more advanced model than 'embedding-001'.
    // According to Google's documentation, 'text-embedding-004' offers stronger
    // retrieval performance and outperforms older models on embedding benchmarks.
    // This change enhances the semantic understanding of queries and content.
    this.model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.model.embedContent({
        content: { parts: [{ text }] },
      });
      return result.embedding.values;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  async search(
    query: string,
    threshold = 0.7,
    limit = 10
  ): Promise<SearchResult[]> {
    // Check cache first
    const cacheKey = `semantic_search:${query}:${threshold}:${limit}`; // Added prefix for clarity in shared cache
    const cached = aiCache.get<SearchResult[]>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);

      // Perform similarity search in the database
      const { data: results, error } = await supabase.rpc('match_businesses', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
      });

      if (error) throw error;

      // Transform results to match SearchResult interface
      const formattedResults = results.map((r: any) => ({
        id: r.id,
        business_id: r.business_id,
        name: r.name,
        description: r.description,
        similarity: r.similarity,
        metadata: r.metadata || {}
      }));

      // Cache the results using aiCache with a 1-hour TTL
      aiCache.set(cacheKey, formattedResults, { ttl: 60 * 60 * 1000 });

      return formattedResults;
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw new Error('Failed to perform semantic search');
    }
  }

  async addDocument(businessId: number, content: string, metadata: Record<string, any> = {}) {
    try {
      const embedding = await this.generateEmbedding(content);
      
      // First, insert the business if it doesn't exist
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .upsert(
          { 
            id: businessId, 
            name: metadata.name || 'Unnamed Business', 
            description: content 
          },
          { onConflict: 'id' }
        )
        .select('id')
        .single();

      if (businessError) throw businessError;

      // Then insert or update the embedding
      const { error } = await supabase
        .from('business_embeddings')
        .upsert(
          {
            business_id: businessId,
            embedding,
            metadata: { ...metadata, content },
          },
          { onConflict: 'business_id' }
        );

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding document:', error);
      throw new Error('Failed to add document');
    }
  }

  /**
   * Clears semantic search related entries from the aiCache.
   * Note: This is a naive implementation. For a large number of cached items,
   * a more targeted approach (e.g., using tags if aiCache supports it for prefixes)
   * or tracking keys would be more efficient. Currently, aiCache does not expose
   * a method to clear by prefix directly. This method is a placeholder or would
   * need aiCache to be augmented.
   * For now, it's a no-op to prevent clearing the entire aiCache unintentionally.
   */
  clearCache() {
    // Option 1: If aiCache had a clearByPrefix or uses tags for this key.
    // aiCache.invalidateByTag(`semantic_search_query`); // Assuming keys were tagged
    // aiCache.deleteByPrefix(cacheKeyPrefix); // If such method existed

    // Option 2: No-op or log, as clearing the whole aiCache might be too broad.
    console.warn("SemanticSearchEngine.clearCache() called. Specific cache clearing for semantic search prefix not implemented in shared aiCache without tag/prefix support. Consider clearing specific keys if known, or enhancing aiCache.");
    // To clear *all* aiCache (use with caution):
    // aiCache.clear();
  }
}
