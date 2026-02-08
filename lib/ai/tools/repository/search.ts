
import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const searchRepositoriesSchema = z.object({
  query: z.string().describe('Search query (e.g., "react", "todo"). Can include qualifiers but helper params are preferred.'),
  language: z.string().optional().describe('Filter by language (e.g., "typescript", "python")'),
  user: z.string().optional().describe('Filter by specific user or organization'),
  topic: z.string().optional().describe('Filter by topic'),
  sort: z.enum(['stars', 'forks', 'updated']).optional().describe('Sort field'),
  order: z.enum(['asc', 'desc']).optional().describe('Sort order'),
  limit: z.number().min(1).max(100).optional().describe('Number of results. Default: 10.'),
});

export const searchRepositories = tool({
  description: 'Search for repositories on GitHub. Use this to find repos based on a query.',
  inputSchema: searchRepositoriesSchema,
  execute: async ({ query, language, user, topic, sort, order, limit = 10 }: z.infer<typeof searchRepositoriesSchema>) => {
    const octokit = await getGitHubClient();
    
    // Construct advanced query
    let q = query;
    if (language) q += ` language:${language}`;
    if (user) q += ` user:${user}`;
    if (topic) q += ` topic:${topic}`;

    try {
      const { data } = await octokit.rest.search.repos({
        q,
        sort,
        order,
        per_page: limit,
      });
      return data.items.map(repo => ({
        full_name: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        language: repo.language,
        html_url: repo.html_url,
        updated_at: repo.updated_at,
        pushed_at: repo.pushed_at,
        topics: repo.topics,
        homepage: repo.homepage,
      }));
    } catch (error: any) {
      return {
        error: error.message || 'Failed to search repositories',
        status: error.status,
      };
    }
  },
});
