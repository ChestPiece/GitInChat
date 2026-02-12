import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const updateRepositorySchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  name: z.string().optional().describe('New repository name'),
  description: z.string().optional().describe('New description'),
  homepage: z.string().optional().describe('Homepage URL'),
  private: z.boolean().optional().describe('Change visibility (true=private, false=public)'),
  has_issues: z.boolean().optional().describe('Enable/disable issues'),
  has_wiki: z.boolean().optional().describe('Enable/disable wiki'),
  default_branch: z.string().optional().describe('Change default branch'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const updateRepositoryTool = tool({
  description: `
  Update repository settings.
  
  Use this when the user wants to:
  - Change the repository name or description
  - Toggle visibility (public/private)
  - Enable/disable issues or wiki
  - Change the default branch
  
  Always confirm with the user before making changes.
  `,
  
  inputSchema: updateRepositorySchema,
  
  execute: async ({ owner, repo, ...updates }: z.infer<typeof updateRepositorySchema>) => {
    try {
      const octokit = await getGitHubClient();
      
      const { data } = await octokit.rest.repos.update({
        owner,
        repo,
        ...updates
      });
      
      const updatedFields = Object.keys(updates);
      
      return createSuccess({
        name: data.name,
        description: data.description,
        private: data.private,
        html_url: data.html_url,
        updated_fields: updatedFields,
        message: 'Repository updated successfully'
      });
      
    } catch (error: any) {
      if (error.status === 404) {
        return createError(`Repository ${owner}/${repo} not found.`);
      }
      
      if (error.status === 403) {
        return createError('Permission denied. You must be an owner or admin to update settings.');
      }
      
      if (error.status === 422) {
        return createError('Invalid update parameters (e.g., name already taken).');
      }
      
      return createError(error.message || 'Failed to update repository');
    }
  },
});
