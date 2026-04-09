import { createTool } from '../../create-tool';
import { z } from 'zod';
import { getGitHubClient } from '@/lib/github/client';

const batchExecuteSchema = z.object({
  operation: z.enum(['archive', 'unarchive', 'star', 'unstar', 'delete']).describe(
    'Operation to perform on each repository'
  ),
  repositories: z.array(z.string()).describe(
    'List of "owner/repo" strings to operate on'
  ),
  dryRun: z.boolean().optional().describe(
    'If true, report what would happen without executing. Default: false'
  ),
});

type BatchResult = {
  repo: string;
  success: boolean;
  error?: string;
};

async function executeOp(
  octokit: Awaited<ReturnType<typeof getGitHubClient>>,
  operation: string,
  owner: string,
  repo: string
): Promise<{ headers: Record<string, string> }> {
  switch (operation) {
    case 'archive':
      return octokit.rest.repos.update({ owner, repo, archived: true });
    case 'unarchive':
      return octokit.rest.repos.update({ owner, repo, archived: false });
    case 'star':
      return octokit.rest.activity.starRepoForAuthenticatedUser({ owner, repo });
    case 'unstar':
      return octokit.rest.activity.unstarRepoForAuthenticatedUser({ owner, repo });
    case 'delete':
      return octokit.rest.repos.delete({ owner, repo });
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

export const batchExecuteRepositoryOps = createTool({
  description:
    'Execute a management operation (archive, unarchive, star, unstar, delete) across multiple repositories. Use when the user wants to perform the same action on many repos (>3). Shows streaming progress and respects GitHub rate limits.',

  inputSchema: batchExecuteSchema,

  execute: async ({ operation, repositories, dryRun = false }) => {
    if (repositories.length === 0) {
      return { success: false, error: 'No repositories provided.' };
    }

    if (dryRun) {
      return {
        success: true,
        data: {
          dryRun: true,
          operation,
          would_affect: repositories,
          count: repositories.length,
          message: `Dry run: would ${operation} ${repositories.length} repositor${repositories.length === 1 ? 'y' : 'ies'}.`,
        },
      };
    }

    const octokit = await getGitHubClient();
    const results: BatchResult[] = [];
    const BATCH_SIZE = 5;
    const BATCH_DELAY_MS = 100;

    for (let i = 0; i < repositories.length; i += BATCH_SIZE) {
      const batch = repositories.slice(i, i + BATCH_SIZE);

      for (const fullName of batch) {
        const [owner, repo] = fullName.split('/');
        if (!owner || !repo) {
          results.push({ repo: fullName, success: false, error: 'Invalid format — use "owner/repo"' });
          continue;
        }

        try {
          const response = await executeOp(octokit, operation, owner, repo);

          // Check rate limit from response headers
          const remaining = parseInt(
            (response as any).headers?.['x-ratelimit-remaining'] ?? '1000',
            10
          );
          if (remaining < 100) {
            // Pause and surface a warning — don't continue hammering the API
            const completed = results.filter(r => r.success).length + 1;
            results.push({ repo: fullName, success: true });
            return {
              success: true,
              data: {
                paused: true,
                reason: 'Rate limit low',
                ratelimit_remaining: remaining,
                completed,
                total: repositories.length,
                results,
                message: `Rate limit low (${remaining} remaining) — paused after ${completed} of ${repositories.length}. Run again to continue from where we left off.`,
              },
            };
          }

          results.push({ repo: fullName, success: true });
        } catch (error: any) {
          results.push({
            repo: fullName,
            success: false,
            error: error.message || 'Unknown error',
          });
        }
      }

      // Small delay between batches
      if (i + BATCH_SIZE < repositories.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);

    return {
      success: true,
      data: {
        paused: false,
        operation,
        completed: succeeded,
        total: repositories.length,
        results,
        failures: failed.length > 0 ? failed : undefined,
        message:
          failed.length > 0
            ? `${operation}: ${succeeded}/${repositories.length} succeeded. ${failed.length} failed: ${failed.map(f => `${f.repo} (${f.error})`).join(', ')}`
            : `${operation}: all ${succeeded} repositor${succeeded === 1 ? 'y' : 'ies'} updated successfully.`,
      },
    };
  },
});
