import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const countRepositoriesSchema = z.object({
  visibility: z.enum(['all', 'public', 'private']).optional().describe('Filter by visibility. Default: all.'),
  affiliation: z.enum(['owner', 'collaborator', 'organization_member', 'owner,collaborator', 'owner,collaborator,organization_member']).optional().describe('Filter by affiliation. Default: owner,collaborator,organization_member.'),
  type: z.enum(['all', 'owner', 'public', 'private', 'member', 'forks', 'sources', 'archived']).optional().describe('Filter by type. Use "archived" to count only archived repos.'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const countRepositories = createTool({
  description: 'Get the total count of repositories for the authenticated user. Use this when user asks "how many repos do I have?" or "count my forked repos".',
  inputSchema: countRepositoriesSchema,
  execute: async ({ visibility = 'all', affiliation = 'owner,collaborator,organization_member', type }: z.infer<typeof countRepositoriesSchema>) => {
    const octokit = await getGitHubClient();
    try {
      let total = 0;
      let page = 1;
      
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
          per_page: 100,
          page,
          visibility: apiVisibility,
          affiliation: apiAffiliation,
          // type: ... DO NOT SEND TYPE
        });
        
        let count = data.length;
        
        // If we need to filter manually
        if (type === 'forks' || type === 'sources' || type === 'archived') {
           count = data.filter(repo => {
            if (type === 'forks') return repo.fork === true;
            if (type === 'sources') return repo.fork === false;
            if (type === 'archived') return repo.archived === true;
            return true;
          }).length;
        }

        total += count;
        if (data.length < 100) break;
        page++;
      } while (page <= 10);
      
      return createSuccess({
        total,
        visibility,
        affiliation,
        type,
        message: `You have ${total} ${type ? type + ' ' : ''}repositories.`,
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to count repositories');
    }
  },
});
