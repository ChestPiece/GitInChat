import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const createRepositorySchema = z.object({
  name: z.string()
    .regex(/^[a-zA-Z0-9._-]+$/, 'Name must contain only alphanumeric characters, periods, underscores, and dashes.')
    .min(1).max(100)
    .describe('Repository name (alphanumeric, dashes, underscores)'),
  description: z.string().optional().describe('Repository description'),
  private: z.boolean().optional().default(false).describe('True for private repo, false for public'),
  auto_init: z.boolean().optional().default(false).describe('Initialize with README'),
  gitignore_template: z.string().optional().describe('Gitignore template (e.g., "Node", "Python")'),
  license_template: z.string().optional().describe('License template (e.g., "mit", "apache-2.0")'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const createRepositoryTool = createTool({
  description: `
  Create a new repository for the authenticated user.
  
  Use this when:
  - User explicitly asks to create a new repo
  - User wants to start a new project
  
  You can set visibility, description, and auto-initialization options.
  `,
  
  parameters: createRepositorySchema,
  
  execute: async (params: z.infer<typeof createRepositorySchema>) => {
    try {
      const octokit = await getGitHubClient();
      
      const { data } = await octokit.rest.repos.createForAuthenticatedUser({
        name: params.name,
        description: params.description,
        private: params.private,
        auto_init: params.auto_init,
        gitignore_template: params.gitignore_template,
        license_template: params.license_template,
      });
      
      return createSuccess({
        name: data.name,
        full_name: data.full_name,
        html_url: data.html_url,
        private: data.private,
        description: data.description,
        clone_url: data.clone_url,
        message: `Repository "${data.name}" created successfully`,
        warning: params.name !== data.name 
          ? `Note: Repository name was sanitized by GitHub from "${params.name}" to "${data.name}"` 
          : undefined
      });
      
    } catch (error: any) {
      if (error.status === 422) {
        return createError('Repository name already exists or input is invalid.');
      }
      
      if (error.status === 403) {
        return createError('Insufficient permissions or quota exceeded.');
      }
      
      return createError(error.message || 'Failed to create repository');
    }
  },
});
