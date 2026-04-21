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
    [key: string]: unknown;
  };
  similarity: number;
}

export type SearchOptions = {
  /** Required: only return chunks indexed for this Supabase auth user. */
  userId: string;
  repoName?: string;
  repoId?: number;
  limit?: number;
  threshold?: number;
};

/**
 * Search for similar documents using vector similarity search.
 * Scoped to the given user (RAG tenant isolation).
 */
export async function searchSimilarDocuments(
  query: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  const {
    userId,
    repoName,
    repoId,
    limit = 5,
    threshold = 0.7,
  } = options;

  try {
    const queryEmbedding = await generateEmbedding(query);

    const { data, error } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_user_id: userId,
    });

    if (error) {
      console.error('Vector search error:', error);
      throw error;
    }

    let results = (data || []) as SearchResult[];

    if (repoName) {
      results = results.filter(
        (doc) => doc.metadata?.repo_name === repoName
      );
    }

    if (repoId !== undefined) {
      results = results.filter((doc) => doc.metadata?.repo_id === repoId);
    }

    results = results.slice(0, limit);

    console.log(
      `🔍 Found ${results.length} similar documents for query: "${query.substring(0, 50)}..."`
    );

    return results;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error searching documents:', message);
    throw error;
  }
}

/**
 * Search within a specific file or directory path (user-scoped).
 */
export async function searchInPath(
  query: string,
  pathPrefix: string,
  options: {
    userId: string;
    limit?: number;
    threshold?: number;
  }
): Promise<SearchResult[]> {
  const { limit = 5, threshold = 0.7, userId } = options;

  const queryEmbedding = await generateEmbedding(query);

  const { data, error } = await supabaseAdmin.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: limit * 2,
    filter_user_id: userId,
  });

  if (error) throw error;

  const results = ((data || []) as SearchResult[])
    .filter((doc) => doc.metadata?.file_path?.startsWith(pathPrefix))
    .slice(0, limit);

  return results;
}

/**
 * Get all documents for a specific repository (without semantic search), user-scoped.
 */
export async function getRepositoryDocuments(
  repoName: string,
  options: {
    userId: string;
    limit?: number;
    offset?: number;
  }
): Promise<SearchResult[]> {
  const { limit = 100, offset = 0, userId } = options;

  const { data, error } = await supabaseAdmin
    .from('documents')
    .select('id, content, metadata')
    .eq('user_id', userId)
    .eq('metadata->>repo_name', repoName)
    .range(offset, offset + limit - 1)
    .order('id', { ascending: true });

  if (error) {
    console.error('Error fetching repository documents:', error);
    throw error;
  }

  return (data || []).map((doc) => ({
    ...doc,
    similarity: 1.0,
  }));
}

/**
 * Get statistics about indexed documents (optionally scoped to one user).
 */
export async function getIndexStats(
  repoName?: string,
  userId?: string
): Promise<{
  totalDocuments: number;
  totalRepos: number;
  repoBreakdown?: { repo_name: string; count: number }[];
}> {
  try {
    if (repoName) {
      let q = supabaseAdmin
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('metadata->>repo_name', repoName);
      if (userId) {
        q = q.eq('user_id', userId);
      }
      const { count, error } = await q;

      if (error) throw error;

      return {
        totalDocuments: count || 0,
        totalRepos: 1,
      };
    }

    let countQuery = supabaseAdmin
      .from('documents')
      .select('*', { count: 'exact', head: true });
    if (userId) {
      countQuery = countQuery.eq('user_id', userId);
    }
    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    let docsQuery = supabaseAdmin.from('documents').select('metadata');
    if (userId) {
      docsQuery = docsQuery.eq('user_id', userId);
    }
    const { data: docs, error: docsError } = await docsQuery;

    if (docsError) throw docsError;

    const repoCounts = new Map<string, number>();
    docs?.forEach((doc) => {
      const name = doc.metadata?.repo_name as string | undefined;
      if (name) {
        repoCounts.set(name, (repoCounts.get(name) || 0) + 1);
      }
    });

    const repoBreakdown = Array.from(repoCounts.entries())
      .map(([repo_name, c]) => ({ repo_name, count: c }))
      .sort((a, b) => b.count - a.count);

    return {
      totalDocuments: count || 0,
      totalRepos: repoCounts.size,
      repoBreakdown,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error getting index stats:', message);
    throw error;
  }
}
