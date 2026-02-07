
import { tool } from 'ai';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const getRepositoryDetailsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
});

export const getRepositoryDetails = tool<any, any>({
  description: 'Get details of a specific repository. Use this to get info like stars, forks, issues, etc.',
  inputSchema: getRepositoryDetailsSchema,
  execute: async ({ owner, repo }: z.infer<typeof getRepositoryDetailsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.get({
        owner,
        repo,
      });
      return {
        name: data.name,
        full_name: data.full_name,
        description: data.description,
        stars: data.stargazers_count,
        forks: data.forks_count,
        open_issues: data.open_issues_count,
        language: data.language,
        created_at: data.created_at,
        updated_at: data.updated_at,
        pushed_at: data.pushed_at,
        default_branch: data.default_branch,
        html_url: data.html_url,
        visibility: data.visibility,
        archived: data.archived,
        disabled: data.disabled,
        is_template: data.is_template,
        topics: data.topics,
        homepage: data.homepage,
        license: data.license ? {
          name: data.license.name,
          key: data.license.key,
          url: data.license.url,
        } : null,
      };
    } catch (error: any) {
      if (error.status === 404) {
        return {
          error: `Repository ${owner}/${repo} not found.`,
          status: 404,
        };
      }
      return {
        error: error.message || 'Failed to get repository details',
        status: error.status,
      };
    }
  },
});
