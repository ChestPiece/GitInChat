
import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const updateRepositorySchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  description: z.string().optional().describe('New description'),
  homepage: z.string().optional().describe('New homepage URL'),
  private: z.boolean().optional().describe('Update visibility (true for private, false for public)'),
  archived: z.boolean().optional().describe('Update archive state (true to archive, false to unarchive)'),
});

export const updateRepository = tool<any, any>({
  description: 'Update a repository. Use this to update repo details.',
  inputSchema: updateRepositorySchema,
  execute: async ({ owner, repo, description, homepage, private: isPrivate, archived }: z.infer<typeof updateRepositorySchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.update({
        owner,
        repo,
        description,
        homepage,
        private: isPrivate,
        archived,
      });
      return {
        success: true,
        message: `Updated repository ${owner}/${repo}`,
        repository: {
          full_name: data.full_name,
          description: data.description,
          private: data.private,
          archived: data.archived,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});
