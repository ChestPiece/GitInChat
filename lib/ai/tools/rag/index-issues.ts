import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateEmbedding } from '@/lib/rag/embeddings';

const indexIssuesSchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  state: z.enum(['open', 'closed', 'all']).optional().describe('Which issues/PRs to index. Default: open.'),
  include_prs: z.boolean().optional().describe('Also index pull requests. Default: true.'),
  limit: z.number().min(1).max(500).optional().describe('Max issues to index. Default: 100.'),
});

export const indexIssuesTool = createTool({
  description:
    'Index issues and pull requests from a repository for semantic search. Run this before using searchIssues. Stores title + body as embeddings in the knowledge base.',

  inputSchema: indexIssuesSchema,

  execute: async ({ owner, repo, state = 'open', include_prs = true, limit = 100 }) => {
    const octokit = await getGitHubClient();
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'Not authenticated.' };
    }

    const { data: repoData } = await octokit.rest.repos.get({ owner, repo });
    const repoId = repoData.id;
    const repoName = `${owner}/${repo}`;

    // Delete old issue/PR index for this repo
    await supabaseAdmin
      .from('documents')
      .delete()
      .eq('user_id', user.id)
      .eq('metadata->>repo_id', repoId.toString())
      .eq('metadata->>type', 'issue');

    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state,
      per_page: Math.min(limit, 100),
      sort: 'updated',
      direction: 'desc',
    });

    let indexed = 0;
    const errors: string[] = [];

    for (const issue of issues) {
      const isPR = !!(issue as any).pull_request;
      if (isPR && !include_prs) continue;

      const text = `${issue.title}\n\n${issue.body ?? ''}`.trim();
      if (!text) continue;

      try {
        const embedding = await generateEmbedding(text);
        const { error } = await supabaseAdmin.from('documents').insert({
          user_id: user.id,
          content: text,
          embedding,
          metadata: {
            type: 'issue',
            repo_id: repoId,
            repo_name: repoName,
            issue_number: issue.number,
            is_pr: isPR,
            state: issue.state,
            labels: issue.labels.map((l: any) => (typeof l === 'string' ? l : l.name)),
            url: issue.html_url,
            indexed_at: new Date().toISOString(),
          },
        });
        if (error) {
          errors.push(`#${issue.number}: ${error.message}`);
        } else {
          indexed++;
        }
      } catch (err: any) {
        errors.push(`#${issue.number}: ${err.message}`);
      }
    }

    return {
      success: true,
      data: {
        repo: repoName,
        indexed,
        total_fetched: issues.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Indexed ${indexed} issues/PRs from ${repoName}. Use searchIssues to find relevant ones.`,
      },
    };
  },
});

const searchIssuesSchema = z.object({
  query: z.string().describe('Natural language search query, e.g. "authentication bug" or "performance in list view"'),
  repo: z.string().optional().describe('Filter to a specific "owner/repo". Leave empty to search all indexed repos.'),
  limit: z.number().min(1).max(20).optional().describe('Number of results. Default: 5.'),
  threshold: z.number().min(0).max(1).optional().describe('Similarity threshold. Default: 0.65.'),
});

export const searchIssuesTool = createTool({
  description:
    'Semantically search indexed issues and pull requests. Use this to find issues similar to a described bug or feature. Requires indexIssues to have been run first.',

  inputSchema: searchIssuesSchema,

  execute: async ({ query, repo, limit = 5, threshold = 0.65 }) => {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: 'Not authenticated.' };
    }

    const embedding = await generateEmbedding(query);

    const { data, error } = await supabaseAdmin.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: limit * 3,
      filter_user_id: user.id,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    let results = (data || []).filter((doc: any) => doc.metadata?.type === 'issue');

    if (repo) {
      results = results.filter((doc: any) => doc.metadata?.repo_name === repo);
    }

    results = results.slice(0, limit);

    return {
      success: true,
      data: {
        query,
        count: results.length,
        results: results.map((doc: any) => ({
          repo: doc.metadata.repo_name,
          number: doc.metadata.issue_number,
          is_pr: doc.metadata.is_pr,
          state: doc.metadata.state,
          labels: doc.metadata.labels,
          url: doc.metadata.url,
          similarity: doc.similarity,
          excerpt: doc.content.substring(0, 300),
        })),
      },
    };
  },
});
