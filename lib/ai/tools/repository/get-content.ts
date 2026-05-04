
import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const getRepositoryFileContentSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the file'),
});

import { createSuccess, createError, validateRepoInput, validatePathInput } from '../../utils';

export const getRepositoryFileContent = createTool({
  description: 'Get the content of a file in a repository. Use this to read code or config files.',
  inputSchema: getRepositoryFileContentSchema,
  execute: async ({ owner, repo, path }: z.infer<typeof getRepositoryFileContentSchema>) => {
    const repoValidation = validateRepoInput(owner, repo);
    if (!repoValidation.valid) {
      return createError(repoValidation.error || 'Invalid input');
    }
    const pathValidation = validatePathInput(path);
    if (!pathValidation.valid) {
      return createError(pathValidation.error || 'Invalid path');
    }

    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(data) || (data as any).type !== 'file') {
        return createError('Path is a directory or submodule, not a file.');
      }

      // Content is base64 encoded
      const content = Buffer.from((data as any).content, 'base64').toString('utf-8');
      
      if (content.length > 20000) {
         return createSuccess({ 
             content: content.slice(0, 20000) + '\n...(truncated)', 
             truncated: true,
             message: 'File content truncated because it is too large.'
         });
      }

      return createSuccess({ content });
    } catch (error: any) {
      return createError(error.message || 'Failed to fetch file content');
    }
  },
});
