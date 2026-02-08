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

export const listRepositories = tool({
  description: 'List repositories of the authenticated user. IMPORTANT: When user asks for "all repos" or "show me everything", set fetchAll=true. To list ARCHIVED repos, set type="archived".',
  inputSchema: listRepositoriesSchema,
  execute: async ({ sort = 'updated', direction = 'desc', limit = 100, visibility = 'all', affiliation = 'owner,collaborator,organization_member', fetchAll = false, type }: z.infer<typeof listRepositoriesSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const allRepos: any[] = [];
      let page = 1;
      const perPage = fetchAll ? 100 : limit;
      
      // Map 'type' to visibility/affiliation for the API call
      // The GitHub API errors if 'type' is sent with 'visibility' or 'affiliation'.
      // So we prioritize mapping 'type' to the correct visibility/affiliation params
      // and DO NOT send 'type' to the API.
      
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
        // For 'all', 'forks', 'sources', 'archived', we use the defaults (or user provided visibility/affiliation)
        // effectively fetching 'all' relative to that scope.
      }

      do {
        const { data } = await octokit.rest.repos.listForAuthenticatedUser({
          sort: sort as "created" | "updated" | "pushed" | "full_name" | undefined,
          direction: direction as "asc" | "desc" | undefined,
          per_page: perPage,
          page,
          visibility: apiVisibility,
          affiliation: apiAffiliation,
          // type: ... DO NOT SEND TYPE
        });
        
        const mapped = data
          .filter(repo => {
            if (type === 'forks') return repo.fork === true;
            if (type === 'sources') return repo.fork === false;
            // The API returns archived repos by default, but if user explicitly asks for ONLY archived:
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
        
        // If not fetching all, or we got fewer than requested, stop
        if (!fetchAll || data.length < perPage) break;
        page++;
      } while (fetchAll && page <= 10); // Safety limit of 1000 repos
      
      return {
        total: allRepos.length,
        filter: type || 'all',
        repositories: allRepos,
      };
    } catch (error: any) {
      return {
        error: error.message || 'Failed to list repositories',
        status: error.status,
      };
    }
  },
});


