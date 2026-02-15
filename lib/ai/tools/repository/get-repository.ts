import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const getRepositorySchema = z.object({
  owner: z.string().describe('Repository owner username'),
  repo: z.string().describe('Repository name'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const getRepositoryTool = createTool({
  description: `...`, // (description remains)
  inputSchema: getRepositorySchema,
  execute: async ({ owner, repo }: z.infer<typeof getRepositorySchema>) => {
    try {
      const octokit = await getGitHubClient();
      
      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });
      
      return createSuccess({
          name: data.name,
          full_name: data.full_name,
          description: data.description,
          private: data.private,
          owner: { 
            login: data.owner.login, 
            avatar_url: data.owner.avatar_url 
          },
          html_url: data.html_url,
          language: data.language,
          stargazers_count: data.stargazers_count,
          forks_count: data.forks_count,
          open_issues_count: data.open_issues_count,
          watchers_count: data.watchers_count,
          default_branch: data.default_branch,
          created_at: data.created_at,
          updated_at: data.updated_at,
          pushed_at: data.pushed_at,
          size: data.size,
          license: data.license ? { name: data.license.name } : null,
          topics: data.topics,
          archived: data.archived,
        });
        // Note: Previously returned { success: true, repository: ... }. 
        // Now returning { success: true, data: ... }. 
        // ChatToolInvocation expects result (data) to be the repo object directly.
      
    } catch (error: any) {
      if (error.status === 404) {
        return createError(`Repository ${owner}/${repo} not found.`);
      }
      
      if (error.status === 403) {
        return createError(`Permission denied. You may not have access to ${owner}/${repo}.`);
      }
      
      throw error;
    }
  },
});
