import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const listContributorsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  limit: z.number().min(1).max(100).optional().describe('Number of contributors to return. Default: 30.'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const listContributors = createTool({
  description: 'List contributors to a repository with their commit counts. Use this to see who has contributed.',
  inputSchema: listContributorsSchema,
  execute: async ({ owner, repo, limit = 30 }: z.infer<typeof listContributorsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.listContributors({
        owner,
        repo,
        per_page: limit,
      });
      
      return createSuccess({
        total: data.length,
        contributors: data.map(contributor => ({
          username: contributor.login,
          contributions: contributor.contributions,
          avatar_url: contributor.avatar_url,
          profile_url: contributor.html_url,
        })),
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to list contributors');
    }
  },
});
