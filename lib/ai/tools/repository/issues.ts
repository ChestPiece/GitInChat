import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const listIssuesSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  state: z.enum(['open', 'closed', 'all']).optional().describe('Issue state. Default: open.'),
  labels: z.string().optional().describe('Comma-separated list of labels to filter by'),
  sort: z.enum(['created', 'updated', 'comments']).optional().describe('Sort field. Default: created.'),
  direction: z.enum(['asc', 'desc']).optional().describe('Sort direction. Default: desc.'),
  limit: z.number().min(1).max(100).optional().describe('Number of issues to return. Default: 30.'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const listIssues = createTool({
  description: 'List issues of a repository. Use this to see open/closed issues.',
  inputSchema: listIssuesSchema,
  execute: async ({ owner, repo, state = 'open', labels, sort = 'created', direction = 'desc', limit = 30 }: z.infer<typeof listIssuesSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state,
        labels,
        sort,
        direction,
        per_page: limit,
      });
      
      // Filter out pull requests (GitHub API returns PRs as issues too)
      const issues = data.filter(issue => !issue.pull_request);
      
      return createSuccess({
        total: issues.length,
        state_filter: state,
        issues: issues.map(issue => ({
          number: issue.number,
          title: issue.title,
          state: issue.state,
          author: issue.user?.login,
          labels: issue.labels.map((label: any) => typeof label === 'string' ? label : label.name),
          comments: issue.comments,
          created_at: issue.created_at,
          updated_at: issue.updated_at,
          url: issue.html_url,
        })),
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to list issues');
    }
  },
});

const getIssueDetailsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  issue_number: z.number().describe('Issue number'),
});

export const getIssueDetails = createTool({
  description: 'Get detailed information about a specific issue.',
  inputSchema: getIssueDetailsSchema,
  execute: async ({ owner, repo, issue_number }: z.infer<typeof getIssueDetailsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.issues.get({
        owner,
        repo,
        issue_number,
      });
      
      return createSuccess({
        number: data.number,
        title: data.title,
        body: data.body?.substring(0, 500) || '',
        state: data.state,
        author: data.user?.login,
        assignees: data.assignees?.map(a => a.login),
        labels: data.labels.map((label: any) => typeof label === 'string' ? label : label.name),
        milestone: data.milestone?.title,
        comments: data.comments,
        created_at: data.created_at,
        updated_at: data.updated_at,
        closed_at: data.closed_at,
        url: data.html_url,
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to get issue details');
    }
  },
});
