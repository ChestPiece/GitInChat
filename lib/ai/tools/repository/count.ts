import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const countRepositoriesSchema = z.object({
  visibility: z.enum(['all', 'public', 'private']).optional().describe('Filter by visibility. Default: all.'),
  affiliation: z.enum(['owner', 'collaborator', 'organization_member', 'owner,collaborator', 'owner,collaborator,organization_member']).optional().describe('Filter by affiliation. Default: owner,collaborator,organization_member.'),
});

export const countRepositories = tool({
  description: 'Get the total count of repositories for the authenticated user. Use this when user asks "how many repos do I have?"',
  inputSchema: countRepositoriesSchema,
  execute: async ({ visibility = 'all', affiliation = 'owner,collaborator,organization_member' }: z.infer<typeof countRepositoriesSchema>) => {
    const octokit = await getGitHubClient();
    try {
      let total = 0;
      let page = 1;
      
      do {
        const { data } = await octokit.rest.repos.listForAuthenticatedUser({
          per_page: 100,
          page,
          visibility: visibility as "all" | "public" | "private" | undefined,
          affiliation: affiliation as string | undefined,
        });
        
        total += data.length;
        if (data.length < 100) break;
        page++;
      } while (page <= 10);
      
      return {
        total,
        visibility,
        affiliation,
        message: `You have ${total} repositories.`,
      };
    } catch (error: any) {
      return {
        error: error.message || 'Failed to count repositories',
        status: error.status,
      };
    }
  },
});
