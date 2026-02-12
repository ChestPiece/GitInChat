import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const getLanguagesSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const getLanguages = tool({
  description: 'Get the language breakdown of a repository. Shows bytes per language and percentage.',
  inputSchema: getLanguagesSchema,
  execute: async ({ owner, repo }: z.infer<typeof getLanguagesSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.listLanguages({
        owner,
        repo,
      });
      
      const totalBytes = Object.values(data).reduce((sum, bytes) => sum + bytes, 0);
      
      const languages = Object.entries(data).map(([language, bytes]) => ({
        language,
        bytes,
        percentage: ((bytes / totalBytes) * 100).toFixed(1) + '%',
      }));
      
      return createSuccess({
        total_bytes: totalBytes,
        languages,
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to get languages');
    }
  },
});
