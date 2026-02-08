
import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const createRepositorySchema = z.object({
  name: z.string().describe('Name of the repository'),
  description: z.string().optional().describe('Description of the repository'),
  private: z.boolean().optional().describe('Whether the repository should be private. Default: false.'),
  auto_init: z.boolean().optional().describe('Whether to initialize the repository with a README. Default: true.'),
});

export const createRepository = tool({
  description: 'Create a new repository. Use this to create a new repo.',
  inputSchema: createRepositorySchema,
  execute: async ({ name, description, private: isPrivate, auto_init }: z.infer<typeof createRepositorySchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init,
      });
      return {
        success: true,
        message: `Created repository ${data.full_name}`,
        repository: {
          name: data.name,
          full_name: data.full_name,
          html_url: data.html_url,
          private: data.private,
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
});
