import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  private cache: Map<string, SearchResult[]> = new Map();

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'embedding-001' });
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
    const cacheKey = `${query}:${threshold}:${limit}`;
    const cached = this.cache.get(cacheKey);
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

      // Cache the results
      this.cache.set(cacheKey, formattedResults);
      
      // Set cache expiration (1 hour)
      setTimeout(() => {
        this.cache.delete(cacheKey);
      }, 60 * 60 * 1000);

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

  clearCache() {
    this.cache.clear();
  }
}
