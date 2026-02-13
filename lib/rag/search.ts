import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateEmbedding } from './embeddings';

export interface SearchResult {
  id: number;
  content: string;
  metadata: {
    repo_id?: number;
    repo_name?: string;
    file_path?: string;
    chunk_index?: number;
    total_chunks?: number;
    [key: string]: any;
  };
  similarity: number;
}

/**
 * Search for similar documents using vector similarity search.
 * Returns documents most relevant to the query, ordered by similarity.
 */
export async function searchSimilarDocuments(
  query: string,
  options: {
    repoName?: string;
    repoId?: number;
    limit?: number;
    threshold?: number;
  } = {}
): Promise<SearchResult[]> {
  const {
    repoName,
    repoId,
    limit = 5,
    threshold = 0.7,
  } = options;

  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Call the similarity search function
    const { data, error } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    });

    if (error) {
      console.error('Vector search error:', error);
      throw error;
    }

    // Filter by repo if specified
    let results = data || [];
    
    if (repoName) {
      results = results.filter((doc: SearchResult) => 
        doc.metadata?.repo_name === repoName
      );
    }
    
    if (repoId !== undefined) {
      results = results.filter((doc: SearchResult) => 
        doc.metadata?.repo_id === repoId
      );
    }

    // Take only the requested number after filtering
    results = results.slice(0, limit);

    console.log(`🔍 Found ${results.length} similar documents for query: "${query.substring(0, 50)}..."`);

    return results;
  } catch (error: any) {
    console.error('Error searching documents:', error.message);
    throw error;
  }
}

/**
 * Search within a specific file or directory path
 */
export async function searchInPath(
  query: string,
  pathPrefix: string,
  options: {
    limit?: number;
    threshold?: number;
  } = {}
): Promise<SearchResult[]> {
  const { limit = 5, threshold = 0.7 } = options;

  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabaseAdmin.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit * 2, // Fetch more to allow filtering
  });

  if (error) throw error;

  // Filter by path prefix
  const results = (data || [])
    .filter((doc: SearchResult) => 
      doc.metadata?.file_path?.startsWith(pathPrefix)
    )
    .slice(0, limit);

  return results;
}

/**
 * Get all documents for a specific repository (without semantic search)
 */
export async function getRepositoryDocuments(
  repoName: string,
  options: {
    limit?: number;
    offset?: number;
  } = {}
): Promise<SearchResult[]> {
  const { limit = 100, offset = 0 } = options;

  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id, content, metadata')
    .eq('metadata->>repo_name', repoName)
    .range(offset, offset + limit - 1)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching repository documents:', error);
    throw error;
  }

  return (data || []).map(doc => ({
    ...doc,
    similarity: 1.0, // Not applicable for non-semantic queries
  }));
}

/**
 * Get statistics about indexed documents
 */
export async function getIndexStats(repoName?: string): Promise<{
  totalDocuments: number;
  totalRepos: number;
  repoBreakdown?: { repo_name: string; count: number }[];
}> {
  try {
    if (repoName) {
      const { count, error } = await supabaseAdmin
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('metadata->>repo_name', repoName);

      if (error) throw error;

      return {
        totalDocuments: count || 0,
        totalRepos: 1,
      };
    }

    // Get total count
    const { count, error: countError } = await supabaseAdmin
      .from('documents')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    // Get breakdown by repo (requires aggregation)
    const { data: docs, error: docsError } = await supabaseAdmin
      .from('documents')
      .select('metadata');

    if (docsError) throw docsError;

    const repoCounts = new Map<string, number>();
    docs?.forEach(doc => {
      const repoName = doc.metadata?.repo_name;
      if (repoName) {
        repoCounts.set(repoName, (repoCounts.get(repoName) || 0) + 1);
      }
    });

    const repoBreakdown = Array.from(repoCounts.entries())
      .map(([repo_name, count]) => ({ repo_name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalDocuments: count || 0,
      totalRepos: repoCounts.size,
      repoBreakdown,
    };
  } catch (error: any) {
    console.error('Error getting index stats:', error.message);
    throw error;
  }
}
