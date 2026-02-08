
import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const starRepositorySchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  action: z.enum(['star', 'unstar']).describe('Action to perform'),
});

export const starRepository = tool({
  description: 'Star or unstar a repository. Use this to star/unstar a repo.',
  inputSchema: starRepositorySchema,
  execute: async ({ owner, repo, action }: z.infer<typeof starRepositorySchema>) => {
    const octokit = await getGitHubClient();
    try {
      if (action === 'star') {
        await octokit.rest.activity.starRepoForAuthenticatedUser({ owner, repo });
        return { success: true, message: `Starred ${owner}/${repo}` };
      } else {
        await octokit.rest.activity.unstarRepoForAuthenticatedUser({ owner, repo });
        return { success: true, message: `Unstarred ${owner}/${repo}` };
      }
    } catch (error: any) {
      return { success: false, error: error.message || `Failed to ${action} repository` };
    }
  },
});
