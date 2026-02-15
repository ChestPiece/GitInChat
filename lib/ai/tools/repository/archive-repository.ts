import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const archiveRepositorySchema = z.object({
  owner: z.string().describe('Repository owner'),
  repo: z.string().describe('Repository name'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const archiveRepositoryTool = createTool({
  description: `
  Archive a repository, making it read-only.

  ⚠️ IMPORTANT: Archived repositories:
  - Cannot accept new issues, PRs, or commits
  - Can be unarchived later if needed
  - Remain visible to users with access

  Use this when:
  - User wants to retire an old project
  - Project is no longer maintained
  - Want to preserve history without accepting changes

  Always confirm with the user that they understand archiving makes the repo read-only.
  `,
  
  inputSchema: archiveRepositorySchema,
  
  execute: async ({ owner, repo }: z.infer<typeof archiveRepositorySchema>) => {
    try {
      const octokit = await getGitHubClient();
      
      const { data } = await octokit.rest.repos.update({
        owner,
        repo,
        archived: true,
      });
      
      return createSuccess({
        name: data.name,
        full_name: data.full_name,
        archived: true,
        message: `⚠️ Repository "${repo}" has been archived and is now read-only`
      });
      
    } catch (error: any) {
      if (error.status === 404) {
        return createError(`Repository ${owner}/${repo} not found.`);
      }
      
      if (error.status === 403) {
        return createError('Permission denied. You must be an owner or admin to archive this repository.');
      }
      
      return createError(error.message || 'Failed to archive repository');
    }
  },
});
