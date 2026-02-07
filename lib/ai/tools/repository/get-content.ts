
import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const getRepositoryFileContentSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  path: z.string().describe('Path to the file'),
});

export const getRepositoryFileContent = tool<any, any>({ // Renaming to avoid conflict with imported function, or just export const
  description: 'Get the content of a file in a repository. Use this to read code or config files.',
  inputSchema: getRepositoryFileContentSchema,
  execute: async ({ owner, repo, path }: z.infer<typeof getRepositoryFileContentSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      if (Array.isArray(data) || (data as any).type !== 'file') {
        return { error: 'Path is a directory or submodule, not a file.' };
      }

      // Content is base64 encoded
      // Cast data to any because strict Octokit types make this difficult to narrow
      const content = Buffer.from((data as any).content, 'base64').toString('utf-8');
      
      // Truncate if too large to avoid context window issues (e.g. > 20kb)
      if (content.length > 20000) {
         return { 
             content: content.slice(0, 20000) + '\n...(truncated)', 
             truncated: true,
             message: 'File content truncated because it is too large.'
         };
      }

      return { content };
    } catch (error: any) {
      return { error: error.message || 'Failed to fetch file content' };
    }
  },
});
