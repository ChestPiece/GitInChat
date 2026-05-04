import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const searchRepositoriesSchema = z.object({
  query: z.string().describe('Search query (e.g., "react language:javascript")'),
  sort: z.enum(['stars', 'forks', 'updated', 'help-wanted-issues']).optional().describe('Sort field'),
  order: z.enum(['desc', 'asc']).optional().describe('Sort order'),
  per_page: z.number().max(100).optional().default(30).describe('Number of results per page'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const searchRepositoriesTool = createTool({
  description: `...`, // (description remains)
  inputSchema: searchRepositoriesSchema,
  execute: async ({ query, sort, order, per_page }: z.infer<typeof searchRepositoriesSchema>) => {
    try {
      const octokit = await getGitHubClient();
      
      const { data } = await octokit.rest.search.repos({
        q: query,
        sort,
        order,
        per_page,
      });
      
      return createSuccess({
        total_count: data.total_count,
        repositories: data.items.map(repo => ({
          name: repo.name,
          full_name: repo.full_name,
          description: repo.description,
          owner: { login: repo.owner?.login || '' },
          html_url: repo.html_url,
          language: repo.language,
          stargazers_count: repo.stargazers_count,
          forks_count: repo.forks_count,
          topics: repo.topics || [],
        }))
      });
      
    } catch (error: any) {
      if (error.status === 403) {
          return createError('API rate limit exceeded or permission denied.');
      }
      return createError(error.message || "Failed to search repositories");
    }
  },
});
