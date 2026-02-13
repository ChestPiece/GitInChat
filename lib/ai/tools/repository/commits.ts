import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const listCommitsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  branch: z.string().optional().describe('Branch name. Default: default branch'),
  author: z.string().optional().describe('GitHub username to filter commits by'),
  since: z.string().optional().describe('ISO 8601 date to filter commits after'),
  limit: z.number().min(1).max(100).optional().describe('Number of commits to return. Default: 30.'),
});

import { createSuccess, createError } from '../../utils';

// ... (schema remains)

export const listCommits = createTool({
  description: 'List recent commits of a repository. Use this to see commit history.',
  parameters: listCommitsSchema,
  execute: async ({ owner, repo, branch, author, since, limit = 30 }: z.infer<typeof listCommitsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
        sha: branch,
        author,
        since,
        per_page: limit,
      });
      
      return createSuccess({
        total: data.length,
        commits: data.map(commit => ({
          sha: commit.sha.substring(0, 7),
          message: commit.commit.message.split('\n')[0], // First line only
          author: commit.commit.author?.name,
          author_username: commit.author?.login,
          date: commit.commit.author?.date,
          url: commit.html_url,
        })),
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to list commits');
    }
  },
});

const getCommitDetailsSchema = z.object({
  owner: z.string().describe('Owner of the repository'),
  repo: z.string().describe('Name of the repository'),
  sha: z.string().describe('Commit SHA'),
});

export const getCommitDetails = createTool({
  description: 'Get detailed information about a specific commit including files changed.',
  parameters: getCommitDetailsSchema,
  execute: async ({ owner, repo, sha }: z.infer<typeof getCommitDetailsSchema>) => {
    const octokit = await getGitHubClient();
    try {
      const { data } = await octokit.rest.repos.getCommit({
        owner,
        repo,
        ref: sha,
      });
      
      return createSuccess({
        sha: data.sha,
        message: data.commit.message,
        author: {
          name: data.commit.author?.name,
          email: data.commit.author?.email,
          date: data.commit.author?.date,
          username: data.author?.login,
        },
        stats: {
          additions: data.stats?.additions,
          deletions: data.stats?.deletions,
          total: data.stats?.total,
        },
        files_changed: data.files?.length || 0,
        files: data.files?.slice(0, 20).map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions,
        })),
        url: data.html_url,
      });
    } catch (error: any) {
      return createError(error.message || 'Failed to get commit details');
    }
  },
});
