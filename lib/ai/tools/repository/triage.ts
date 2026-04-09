import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const triageSchema = z.object({
  limit: z.number().min(1).max(50).optional().describe(
    'Max repositories to check. Default: 20. Higher = more thorough but slower.'
  ),
});

export const triageGitHubTool = createTool({
  description:
    'Get a triage summary of everything that needs your attention: open PRs awaiting review, unassigned issues, and recent activity — across all your active repositories. Use when the user asks "what needs my attention?", "morning triage", "what should I look at today?", or "weekly summary".',

  inputSchema: triageSchema,

  execute: async ({ limit = 20 }) => {
    const octokit = await getGitHubClient();

    // Step 1: Get top repos by recent push activity
    const { data: repos } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: 'pushed',
      direction: 'desc',
      per_page: limit,
      affiliation: 'owner,collaborator,organization_member',
    });

    const activeRepos = repos.filter(r => !r.archived && !r.disabled);

    // Step 2: Fan out — fetch PRs and issues for each repo concurrently (batched to avoid rate limits)
    const CONCURRENCY = 5;
    const prItems: Array<{ repo: string; number: number; title: string; url: string; author: string; created_at: string }> = [];
    const issueItems: Array<{ repo: string; number: number; title: string; url: string; created_at: string }> = [];

    for (let i = 0; i < activeRepos.length; i += CONCURRENCY) {
      const batch = activeRepos.slice(i, i + CONCURRENCY);
      await Promise.all(
        batch.map(async repo => {
          try {
            const [prsRes, issuesRes] = await Promise.all([
              octokit.rest.pulls.list({
                owner: repo.owner.login,
                repo: repo.name,
                state: 'open',
                per_page: 10,
                sort: 'updated',
                direction: 'desc',
              }),
              octokit.rest.issues.listForRepo({
                owner: repo.owner.login,
                repo: repo.name,
                state: 'open',
                per_page: 10,
                sort: 'updated',
                direction: 'desc',
                assignee: 'none',
              }),
            ]);

            for (const pr of prsRes.data) {
              prItems.push({
                repo: repo.full_name,
                number: pr.number,
                title: pr.title,
                url: pr.html_url,
                author: pr.user?.login ?? 'unknown',
                created_at: pr.created_at,
              });
            }

            for (const issue of issuesRes.data) {
              // GitHub returns PRs in issues endpoint — filter them out
              if (!(issue as any).pull_request) {
                issueItems.push({
                  repo: repo.full_name,
                  number: issue.number,
                  title: issue.title,
                  url: issue.html_url,
                  created_at: issue.created_at,
                });
              }
            }
          } catch {
            // Skip repos we can't access
          }
        })
      );
    }

    const totalPRs = prItems.length;
    const totalIssues = issueItems.length;

    return {
      success: true,
      data: {
        checked_repos: activeRepos.length,
        summary: `Checked ${activeRepos.length} active repos. Found ${totalPRs} open PR${totalPRs !== 1 ? 's' : ''} and ${totalIssues} unassigned issue${totalIssues !== 1 ? 's' : ''}.`,
        open_pull_requests: {
          count: totalPRs,
          items: prItems.slice(0, 20),
        },
        unassigned_issues: {
          count: totalIssues,
          items: issueItems.slice(0, 20),
        },
        active_repos: activeRepos.map(r => ({
          name: r.full_name,
          pushed_at: r.pushed_at,
        })).slice(0, 10),
      },
    };
  },
});
