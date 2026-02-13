import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const listTagsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  limit: z.number().min(1).max(100).optional().describe('Number of tags to return. Default: 30.'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const listTags = createTool({
  description: 'List git tags of a repository. Use this to see version tags.',
  parameters: listTagsSchema,
  execute: async ({ owner, repo, limit = 30 }: z.infer<typeof listTagsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.listTags({
        owner,
        repo,
        per_page: limit,
      });
      
      return createSuccess({
        total: data.length,
        tags: data.map(tag => ({
          name: tag.name,
          commit_sha: tag.commit.sha.substring(0, 7),
          commit_url: tag.commit.url,
          tarball_url: tag.tarball_url,
          zipball_url: tag.zipball_url,
        })),
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to list tags');
    }
  },
});
