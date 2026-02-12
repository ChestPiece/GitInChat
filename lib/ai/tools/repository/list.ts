import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const listRepositoriesSchema = z.object({
  sort: z.enum(['created', 'updated', 'pushed', 'full_name']).optional().describe('Property to sort by. Default: updated.'),
  direction: z.enum(['asc', 'desc']).optional().describe('Sort direction. Default: desc.'),
  limit: z.number().min(1).max(100).optional().describe('Number of repos per page. Default: 100. Use fetchAll=true to get all repos.'),
  visibility: z.enum(['all', 'public', 'private']).optional().describe('Filter by visibility. Default: all.'),
  affiliation: z.enum(['owner', 'collaborator', 'organization_member', 'owner,collaborator', 'owner,collaborator,organization_member']).optional().describe('Filter by affiliation. Default: owner,collaborator,organization_member.'),
  fetchAll: z.boolean().optional().describe('Set to true to fetch ALL repositories using pagination. Use this when user asks for all repos.'),
  type: z.enum(['all', 'owner', 'public', 'private', 'member', 'forks', 'sources', 'archived']).optional().describe('Filter by type. Use "archived" to list only archived repos.'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const listRepositories = tool({
  description: 'List repositories of the authenticated user. IMPORTANT: When user asks for "all repos" or "show me everything", set fetchAll=true. To list ARCHIVED repos, set type="archived".',
  inputSchema: listRepositoriesSchema,
  execute: async ({ sort = 'updated', direction = 'desc', limit = 100, visibility = 'all', affiliation = 'owner,collaborator,organization_member', fetchAll = false, type }: z.infer<typeof listRepositoriesSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const allRepos: any[] = [];
      let page = 1;
      const perPage = fetchAll ? 100 : limit;
      
      // ... (logic remains same)
      let apiVisibility: "all" | "public" | "private" | undefined = visibility as any;
      let apiAffiliation: string | undefined = affiliation;

      if (type) {
        if (type === 'public') {
          apiVisibility = 'public';
        } else if (type === 'private') {
          apiVisibility = 'private';
        } else if (type === 'owner') {
          apiAffiliation = 'owner';
        } else if (type === 'member') {
          apiAffiliation = 'organization_member';
        } 
      }

      do {
        const { data } = await octokit.rest.repos.listForAuthenticatedUser({
          sort: sort as "created" | "updated" | "pushed" | "full_name" | undefined,
          direction: direction as "asc" | "desc" | undefined,
          per_page: perPage,
          page,
          visibility: apiVisibility,
          affiliation: apiAffiliation,
        });
        
        const mapped = data
          .filter(repo => {
            if (type === 'forks') return repo.fork === true;
            if (type === 'sources') return repo.fork === false;
            if (type === 'archived') return repo.archived === true;
            return true;
          })
          .map(repo => ({
            name: repo.name,
            full_name: repo.full_name,
            private: repo.private,
            archived: repo.archived,
            description: repo.description,
            html_url: repo.html_url,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            language: repo.language,
            updated_at: repo.updated_at,
            owner: repo.owner.login,
          }));
        
        allRepos.push(...mapped);
        
        if (!fetchAll || data.length < perPage) break;
        page++;
      } while (fetchAll && page <= 10);
      
      return createSuccess({
        total: allRepos.length,
        filter: type || 'all',
        repositories: allRepos,
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to list repositories');
    }
  },
});


