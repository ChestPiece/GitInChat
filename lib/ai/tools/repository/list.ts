import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const listRepositoriesSchema = z.object({
  sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe('Property to sort by. Default: updated.'),
  direction: z.enum(['asc', 'desc']).optional().describe('Sort direction. Default: desc.'),
  limit: z.number().min(1).max(100).optional().describe('Number of repos to return. Default: 30.'),
  visibility: z.enum(['all', 'public', 'private']).optional().describe('Filter by visibility. Default: all.'),
  affiliation: z.string().optional().describe('Comma-separated list of affiliations: owner, collaborator, organization_member. Default: owner,collaborator,organization_member.'),
});

export const listRepositories = tool({
  description: 'List the repositories of the authenticated user. Use this to see what repos the user has.',
  inputSchema: listRepositoriesSchema,
  execute: async ({ sort = 'updated', direction = 'desc', limit = 30, visibility = 'all', affiliation }: z.infer<typeof listRepositoriesSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: sort as "created" | "updated" | "pushed" | "full_name" | undefined,
        direction: direction as "asc" | "desc" | undefined,
        per_page: limit,
        visibility: visibility as "all" | "public" | "private" | undefined,
        affiliation: affiliation as string | undefined,
      });
      return data.map(repo => ({
        name: repo.name,
        full_name: repo.full_name,
        private: repo.private,
        description: repo.description,
        html_url: repo.html_url,
        stars: repo.stargazers_count,
        language: repo.language,
        updated_at: repo.updated_at,
        owner: repo.owner.login,
      }));
    } catch (error: any) {
      return {
        error: error.message || 'Failed to list repositories',
        status: error.status,
      };
    }
  },
});
