import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const deleteRepositorySchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
  confirm_name: z.string().describe('User must type exact repo name for confirmation'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const deleteRepositoryTool = createTool({
  description: `
  ⚠️ PERMANENTLY DELETE A REPOSITORY ⚠️

  THIS IS AN IRREVERSIBLE OPERATION. Use with extreme caution.

  Before using this tool:
  1. Ask the user to confirm the exact repository name
  2. Warn about permanent data loss
  3. Verify they understand this CANNOT be undone

  Deleted repositories:
  - Lose all code, history, issues, PRs forever
  - Cannot be recovered
  - Forks are not affected

  ONLY use this when the user:
  - Explicitly uses words like "delete", "remove permanently"
  - Confirms the repository name
  - Acknowledges they understand it's permanent
  `,
  
  parameters: deleteRepositorySchema,
  
  execute: async ({ owner, repo, confirm_name }: z.infer<typeof deleteRepositorySchema>) => {
    // CRITICAL: Verify confirmation
    if (confirm_name !== repo) {
      return createError(`Confirmation failed. Please type the exact repository name "${repo}" to confirm deletion.`);
    }
    
    try {
      const octokit = await getGitHubClient();

      // Check if repo exists and get details for safer confirmation
      const { data: repoDetails } = await octokit.rest.repos.get({ owner, repo });
      
      await octokit.rest.repos.delete({ owner, repo });
      
      return createSuccess({
        deleted_repository: `${owner}/${repo}`,
        message: `❌ Repository "${repo}" has been permanently deleted. This action cannot be undone.`,
      });
    } catch (error: any) {
      if (error.status === 403) {
        return createError('You do not have permission to delete this repository.');
      }
      if (error.status === 404) {
        return createError('Repository not found or already deleted.');
      }
      return createError(error.message || 'Failed to delete repository');
    }
  },
});
