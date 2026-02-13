import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const listPullRequestsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  state: z.enum(['open', 'closed', 'all']).optional().describe('PR state. Default: open.'),
  sort: z.enum(['created', 'updated', 'popularity', 'long-running']).optional().describe('Sort field. Default: created.'),
  direction: z.enum(['asc', 'desc']).optional().describe('Sort direction. Default: desc.'),
  limit: z.number().min(1).max(100).optional().describe('Number of PRs to return. Default: 30.'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const listPullRequests = createTool({
  description: 'List pull requests of a repository. Use this to see open/closed/merged PRs.',
  parameters: listPullRequestsSchema,
  execute: async ({ owner, repo, state = 'open', sort = 'created', direction = 'desc', limit = 30 }: z.infer<typeof listPullRequestsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        state,
        sort,
        direction,
        per_page: limit,
      });
      
      return createSuccess({
        total: data.length,
        state_filter: state,
        pull_requests: data.map(pr => ({
          number: pr.number,
          title: pr.title,
          state: pr.state,
          merged: pr.merged_at !== null,
          author: pr.user?.login,
          base: pr.base.ref,
          head: pr.head.ref,
          created_at: pr.created_at,
          updated_at: pr.updated_at,
          merged_at: pr.merged_at,
          url: pr.html_url,
        })),
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to list pull requests');
    }
  },
});

const getPullRequestDetailsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  pull_number: z.number().describe('Pull request number'),
});

export const getPullRequestDetails = createTool({
  description: 'Get detailed information about a specific pull request.',
  parameters: getPullRequestDetailsSchema,
  execute: async ({ owner, repo, pull_number }: z.infer<typeof getPullRequestDetailsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number,
      });
      
      return createSuccess({
        number: data.number,
        title: data.title,
        body: data.body?.substring(0, 500) || '',
        state: data.state,
        merged: data.merged,
        mergeable: data.mergeable,
        author: data.user?.login,
        base: data.base.ref,
        head: data.head.ref,
        commits: data.commits,
        additions: data.additions,
        deletions: data.deletions,
        changed_files: data.changed_files,
        reviewers: data.requested_reviewers?.map((r: any) => r.login),
        created_at: data.created_at,
        updated_at: data.updated_at,
        merged_at: data.merged_at,
        merged_by: data.merged_by?.login,
        url: data.html_url,
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to get pull request details');
    }
  },
});
