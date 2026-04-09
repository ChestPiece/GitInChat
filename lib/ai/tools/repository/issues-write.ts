import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';
import { createSuccess, createError } from '../../utils';

export const createIssueTool = createTool({
  description: 'Create a new issue in a repository.',
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    title: z.string().describe('Issue title'),
    body: z.string().optional().describe('Issue body (markdown supported)'),
    labels: z.array(z.string()).optional().describe('Label names to apply'),
    assignees: z.array(z.string()).optional().describe('GitHub usernames to assign'),
  }),
  execute: async ({ owner, repo, title, body, labels, assignees }) => {
    try {
      const octokit = await getGitHubClient();
      const { data } = await octokit.rest.issues.create({ owner, repo, title, body, labels, assignees });
      return createSuccess({ number: data.number, title: data.title, url: data.html_url });
    } catch (error: any) {
      return createError(error.message || 'Failed to create issue');
    }
  },
});

export const updateIssueTool = createTool({
  description: 'Update the title, body, or state of an existing issue.',
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    issue_number: z.number().describe('Issue number'),
    title: z.string().optional(),
    body: z.string().optional(),
    state: z.enum(['open', 'closed']).optional(),
    labels: z.array(z.string()).optional().describe('Replaces all existing labels'),
    assignees: z.array(z.string()).optional().describe('Replaces all existing assignees'),
  }),
  execute: async ({ owner, repo, issue_number, ...updates }) => {
    try {
      const octokit = await getGitHubClient();
      const { data } = await octokit.rest.issues.update({ owner, repo, issue_number, ...updates });
      return createSuccess({ number: data.number, state: data.state, url: data.html_url });
    } catch (error: any) {
      return createError(error.message || 'Failed to update issue');
    }
  },
});

export const closeIssueTool = createTool({
  description: 'Close an issue, optionally with a comment.',
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    issue_number: z.number(),
    comment: z.string().optional().describe('Comment to post before closing'),
  }),
  execute: async ({ owner, repo, issue_number, comment }) => {
    try {
      const octokit = await getGitHubClient();
      if (comment) {
        await octokit.rest.issues.createComment({ owner, repo, issue_number, body: comment });
      }
      const { data } = await octokit.rest.issues.update({ owner, repo, issue_number, state: 'closed' });
      return createSuccess({ number: data.number, state: data.state, url: data.html_url, commented: !!comment });
    } catch (error: any) {
      return createError(error.message || 'Failed to close issue');
    }
  },
});

export const addIssueCommentTool = createTool({
  description: 'Add a comment to an existing issue.',
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    issue_number: z.number(),
    body: z.string().describe('Comment body (markdown supported)'),
  }),
  execute: async ({ owner, repo, issue_number, body }) => {
    try {
      const octokit = await getGitHubClient();
      const { data } = await octokit.rest.issues.createComment({ owner, repo, issue_number, body });
      return createSuccess({ comment_id: data.id, url: data.html_url });
    } catch (error: any) {
      return createError(error.message || 'Failed to add comment');
    }
  },
});
