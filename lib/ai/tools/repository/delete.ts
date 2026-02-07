
import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const deleteRepositorySchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
});

export const deleteRepository = tool<any, any>({
  description: 'Delete a repository. Use this to delete a repo.',
  inputSchema: deleteRepositorySchema,
  execute: async ({ owner, repo }: z.infer<typeof deleteRepositorySchema>) => {
    const octokit = await getGitHubClient();
    try {
      await octokit.rest.repos.delete({
        owner,
        repo,
      });
      return { success: true, message: `Deleted repository ${owner}/${repo}` };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});
