import { createTool } from '@/lib/ai/create-tool';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { getGitHubClient } from '@/lib/github/client';
import { indexRepository } from '@/lib/rag/indexer';
import { getIndexStats } from '@/lib/rag/search';

export const indexRepositoryTool = createTool({
  description:
    'Index a GitHub repository to enable code search and context retrieval. This allows the AI to understand and reference code from the repository.',
  inputSchema: z.object({
    owner: z.string().describe('Repository owner (username or organization)'),
    repo: z.string().describe('Repository name'),
    branch: z.string().optional().describe('Branch to index (defaults to HEAD/main)'),
  }),
  execute: async ({ owner, repo, branch }) => {
    try {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        return {
          success: false,
          error: 'Not authenticated — cannot index repository.',
        };
      }

      const octokit = await getGitHubClient();

      const result = await indexRepository(octokit, owner, repo, {
        userId,
        branch,
        filePatterns: [
          /\.(ts|tsx|js|jsx)$/,
          /\.(py)$/,
          /\.(java|kt)$/,
          /\.(go)$/,
          /\.(rs)$/,
          /\.(md|txt)$/,
          /\.(yml|yaml|json)$/,
        ],
        maxFileSize: 200000,
      });

      return {
        success: true,
        message: `Successfully indexed ${result.indexedFiles}/${result.totalFiles} files from ${owner}/${repo}`,
        details: {
          filesIndexed: result.indexedFiles,
          totalFiles: result.totalFiles,
          totalChunks: result.totalChunks,
          errors: result.errors.length,
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: message,
      };
    }
  },
});

export const getIndexStatsTool = createTool({
  description:
    'Get statistics about indexed repositories and code chunks in the RAG system for your account',
  inputSchema: z.object({
    repoName: z
      .string()
      .optional()
      .describe('Specific repository to get stats for (format: owner/repo)'),
  }),
  execute: async ({ repoName }) => {
    try {
      const supabase = await createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        return {
          success: false,
          error: 'Not authenticated.',
        };
      }

      const stats = await getIndexStats(repoName, userId);

      if (repoName) {
        return {
          repository: repoName,
          totalChunks: stats.totalDocuments,
          message: `Repository ${repoName} has ${stats.totalDocuments} indexed code chunks`,
        };
      }

      return {
        totalChunks: stats.totalDocuments,
        totalRepositories: stats.totalRepos,
        repositories:
          stats.repoBreakdown?.map((r) => ({
            name: r.repo_name,
            chunks: r.count,
          })) || [],
        message: `Found ${stats.totalRepos} indexed repositories with ${stats.totalDocuments} total code chunks`,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: message,
      };
    }
  },
});
