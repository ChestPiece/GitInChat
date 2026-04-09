import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  octokitListRepos: vi.fn(),
  octokitReposUpdate: vi.fn(),
  octokitReposCreateForAuth: vi.fn(),
  octokitIssuesList: vi.fn(),
  octokitPullsList: vi.fn(),
  octokitReposGet: vi.fn(),
  octokitActivityStar: vi.fn(),
  octokitReposDelete: vi.fn(),
}));

vi.mock('../lib/github/client', () => ({
  getGitHubClient: () => ({
    rest: {
      repos: {
        listForAuthenticatedUser: mocks.octokitListRepos,
        update: mocks.octokitReposUpdate,
        createForAuthenticatedUser: mocks.octokitReposCreateForAuth,
        get: mocks.octokitReposGet,
        delete: mocks.octokitReposDelete,
      },
      issues: {
        listForRepo: mocks.octokitIssuesList,
      },
      pulls: {
        list: mocks.octokitPullsList,
      },
      activity: {
        starRepoForAuthenticatedUser: mocks.octokitActivityStar,
      },
    },
  }),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeRepo(overrides = {}) {
  return {
    name: 'test-repo',
    full_name: 'owner/test-repo',
    private: false,
    archived: false,
    description: 'A test repo',
    html_url: 'https://github.com/owner/test-repo',
    stargazers_count: 5,
    forks_count: 1,
    language: 'TypeScript',
    updated_at: '2024-01-01T00:00:00Z',
    owner: { login: 'owner' },
    pushed_at: '2024-01-01T00:00:00Z',
    disabled: false,
    fork: false,
    ...overrides,
  };
}

// ─── listRepositories ─────────────────────────────────────────────────────────
describe('listRepositories', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns repo list on success', async () => {
    const { listRepositories } = await import('../lib/ai/tools/repository/list');
    mocks.octokitListRepos.mockResolvedValue({ data: [makeRepo()] });

    const result = await (listRepositories as any).execute({});
    expect(result.success).toBe(true);
    expect(result.data.repositories).toHaveLength(1);
    expect(result.data.repositories[0].name).toBe('test-repo');
  });

  it('filters archived repos when type=archived', async () => {
    const { listRepositories } = await import('../lib/ai/tools/repository/list');
    mocks.octokitListRepos.mockResolvedValue({
      data: [makeRepo({ archived: true }), makeRepo({ name: 'active', full_name: 'owner/active' })],
    });

    const result = await (listRepositories as any).execute({ type: 'archived' });
    expect(result.success).toBe(true);
    expect(result.data.repositories).toHaveLength(1);
    expect(result.data.repositories[0].name).toBe('test-repo');
  });

  it('paginates when fetchAll=true', async () => {
    const { listRepositories } = await import('../lib/ai/tools/repository/list');
    // First page returns 100 items, second page returns 2 (signals end)
    const firstPage = Array(100).fill(null).map((_, i) => makeRepo({ name: `repo-${i}`, full_name: `owner/repo-${i}` }));
    const secondPage = [makeRepo({ name: 'last-1', full_name: 'owner/last-1' }), makeRepo({ name: 'last-2', full_name: 'owner/last-2' })];
    mocks.octokitListRepos
      .mockResolvedValueOnce({ data: firstPage })
      .mockResolvedValueOnce({ data: secondPage });

    const result = await (listRepositories as any).execute({ fetchAll: true });
    expect(result.success).toBe(true);
    expect(result.data.total).toBe(102);
  });

  it('returns error result on API failure', async () => {
    const { listRepositories } = await import('../lib/ai/tools/repository/list');
    mocks.octokitListRepos.mockRejectedValue(new Error('API error'));

    const result = await (listRepositories as any).execute({});
    expect(result.success).toBe(false);
    expect(result.error).toContain('API error');
  });
});

// ─── archiveRepository ────────────────────────────────────────────────────────
describe('archiveRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('archives a repo successfully', async () => {
    const { archiveRepositoryTool } = await import('../lib/ai/tools/repository/archive-repository');
    mocks.octokitReposUpdate.mockResolvedValue({
      data: { name: 'test-repo', full_name: 'owner/test-repo', archived: true },
    });

    const result = await (archiveRepositoryTool as any).execute({ owner: 'owner', repo: 'test-repo' });
    expect(result.success).toBe(true);
    expect(result.data.archived).toBe(true);
  });

  it('returns error on 404', async () => {
    const { archiveRepositoryTool } = await import('../lib/ai/tools/repository/archive-repository');
    const err: any = new Error('Not Found'); err.status = 404;
    mocks.octokitReposUpdate.mockRejectedValue(err);

    const result = await (archiveRepositoryTool as any).execute({ owner: 'owner', repo: 'missing' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('not found');
  });

  it('returns permission error on 403', async () => {
    const { archiveRepositoryTool } = await import('../lib/ai/tools/repository/archive-repository');
    const err: any = new Error('Forbidden'); err.status = 403;
    mocks.octokitReposUpdate.mockRejectedValue(err);

    const result = await (archiveRepositoryTool as any).execute({ owner: 'owner', repo: 'test-repo' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('Permission denied');
  });
});

// ─── createRepository ─────────────────────────────────────────────────────────
describe('createRepository', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a repo with required fields', async () => {
    const { createRepositoryTool } = await import('../lib/ai/tools/repository/create-repository');
    mocks.octokitReposCreateForAuth.mockResolvedValue({
      data: { name: 'new-repo', full_name: 'owner/new-repo', html_url: 'https://github.com/owner/new-repo', private: false, clone_url: '' },
    });

    const result = await (createRepositoryTool as any).execute({ name: 'new-repo' });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('new-repo');
  });
});

// ─── batchExecuteRepositoryOps ────────────────────────────────────────────────
describe('batchExecuteRepositoryOps', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns dry run summary without executing', async () => {
    const { batchExecuteRepositoryOps } = await import('../lib/ai/tools/repository/batch-execute');
    const result = await (batchExecuteRepositoryOps as any).execute({
      operation: 'archive',
      repositories: ['owner/repo-1', 'owner/repo-2'],
      dryRun: true,
    });
    expect(result.success).toBe(true);
    expect(result.data.dryRun).toBe(true);
    expect(result.data.count).toBe(2);
    expect(mocks.octokitReposUpdate).not.toHaveBeenCalled();
  });

  it('archives all repos and reports progress', async () => {
    const { batchExecuteRepositoryOps } = await import('../lib/ai/tools/repository/batch-execute');
    mocks.octokitReposUpdate.mockResolvedValue({
      data: { name: 'r', full_name: 'o/r', archived: true },
      headers: { 'x-ratelimit-remaining': '4999' },
    });

    const result = await (batchExecuteRepositoryOps as any).execute({
      operation: 'archive',
      repositories: ['owner/repo-1', 'owner/repo-2'],
    });
    expect(result.success).toBe(true);
    expect(result.data.completed).toBe(2);
    expect(result.data.paused).toBe(false);
  });

  it('pauses when rate limit remaining drops below 100', async () => {
    const { batchExecuteRepositoryOps } = await import('../lib/ai/tools/repository/batch-execute');
    mocks.octokitReposUpdate.mockResolvedValue({
      data: { name: 'r', full_name: 'o/r', archived: true },
      headers: { 'x-ratelimit-remaining': '50' },
    });

    const result = await (batchExecuteRepositoryOps as any).execute({
      operation: 'archive',
      repositories: ['owner/repo-1', 'owner/repo-2', 'owner/repo-3'],
    });
    expect(result.success).toBe(true);
    expect(result.data.paused).toBe(true);
    expect(result.data.ratelimit_remaining).toBe(50);
  });

  it('handles partial failure gracefully', async () => {
    const { batchExecuteRepositoryOps } = await import('../lib/ai/tools/repository/batch-execute');
    mocks.octokitReposUpdate
      .mockResolvedValueOnce({
        data: { name: 'repo-1', full_name: 'owner/repo-1', archived: true },
        headers: { 'x-ratelimit-remaining': '4999' },
      })
      .mockRejectedValueOnce(new Error('Permission denied'));

    const result = await (batchExecuteRepositoryOps as any).execute({
      operation: 'archive',
      repositories: ['owner/repo-1', 'owner/repo-2'],
    });
    expect(result.success).toBe(true);
    expect(result.data.completed).toBe(1);
    expect(result.data.failures).toHaveLength(1);
    expect(result.data.failures[0].repo).toBe('owner/repo-2');
  });

  it('returns error for invalid repo format', async () => {
    const { batchExecuteRepositoryOps } = await import('../lib/ai/tools/repository/batch-execute');
    const result = await (batchExecuteRepositoryOps as any).execute({
      operation: 'archive',
      repositories: ['not-valid'],
    });
    expect(result.success).toBe(true);
    expect(result.data.failures).toHaveLength(1);
    expect(result.data.failures[0].error).toContain('owner/repo');
  });
});
