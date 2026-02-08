import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const listBranchesSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  protected: z.boolean().optional().describe('Filter by protected status'),
  limit: z.number().min(1).max(100).optional().describe('Number of branches to return. Default: 30.'),
});

export const listBranches = tool({
  description: 'List all branches of a repository. Use this to see what branches exist in a repo.',
  inputSchema: listBranchesSchema,
  execute: async ({ owner, repo, protected: protectedOnly, limit = 30 }: z.infer<typeof listBranchesSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.listBranches({
        owner,
        repo,
        protected: protectedOnly,
        per_page: limit,
      });
      
      return {
        total: data.length,
        branches: data.map(branch => ({
          name: branch.name,
          protected: branch.protected,
          commit_sha: branch.commit.sha,
        })),
      };
    } catch (error: any) {
      return {
        error: error.message || 'Failed to list branches',
        status: error.status,
      };
    }
  },
});

const getBranchDetailsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  branch: z.string().describe('Name of the branch'),
});

export const getBranchDetails = tool({
  description: 'Get detailed information about a specific branch including protection rules.',
  inputSchema: getBranchDetailsSchema,
  execute: async ({ owner, repo, branch }: z.infer<typeof getBranchDetailsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.getBranch({
        owner,
        repo,
        branch,
      });
      
      return {
        name: data.name,
        protected: data.protected,
        commit: {
          sha: data.commit.sha,
          message: data.commit.commit.message,
          author: data.commit.commit.author?.name,
          date: data.commit.commit.author?.date,
        },
        protection_url: data.protection_url,
      };
    } catch (error: any) {
      return {
        error: error.message || 'Failed to get branch details',
        status: error.status,
      };
    }
  },
});
