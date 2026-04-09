import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';
import { createSuccess, createError } from '../../utils';

export const addPRCommentTool = createTool({
  description: 'Add a comment to a pull request.',
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
    body: z.string().describe('Comment body (markdown supported)'),
  }),
  execute: async ({ owner, repo, pull_number, body }) => {
    try {
      const octokit = await getGitHubClient();
      // PR comments use the issues endpoint (issue_number = pull_number)
      const { data } = await octokit.rest.issues.createComment({ owner, repo, issue_number: pull_number, body });
      return createSuccess({ comment_id: data.id, url: data.html_url });
    } catch (error: any) {
      return createError(error.message || 'Failed to add PR comment');
    }
  },
});

export const mergePRTool = createTool({
  description: 'Merge an open pull request.',
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
    merge_method: z.enum(['merge', 'squash', 'rebase']).optional().describe('Default: merge'),
    commit_title: z.string().optional(),
    commit_message: z.string().optional(),
  }),
  execute: async ({ owner, repo, pull_number, merge_method = 'merge', commit_title, commit_message }) => {
    try {
      const octokit = await getGitHubClient();
      const { data } = await octokit.rest.pulls.merge({
        owner,
        repo,
        pull_number,
        merge_method,
        commit_title,
        commit_message,
      });
      return createSuccess({ merged: data.merged, sha: data.sha, message: data.message });
    } catch (error: any) {
      return createError(error.message || 'Failed to merge pull request');
    }
  },
});

export const closePRTool = createTool({
  description: 'Close (without merging) a pull request, optionally with a comment.',
  inputSchema: z.object({
    owner: z.string(),
    repo: z.string(),
    pull_number: z.number(),
    comment: z.string().optional().describe('Comment to post before closing'),
  }),
  execute: async ({ owner, repo, pull_number, comment }) => {
    try {
      const octokit = await getGitHubClient();
      if (comment) {
        await octokit.rest.issues.createComment({ owner, repo, issue_number: pull_number, body: comment });
      }
      const { data } = await octokit.rest.pulls.update({ owner, repo, pull_number, state: 'closed' });
      return createSuccess({ number: data.number, state: data.state, url: data.html_url, commented: !!comment });
    } catch (error: any) {
      return createError(error.message || 'Failed to close pull request');
    }
  },
});
