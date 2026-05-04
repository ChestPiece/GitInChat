import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  verify: vi.fn(),
  send: vi.fn(),
  saveGithubEvent: vi.fn(),
  dispatchEvent: vi.fn(),
}));

vi.mock('@octokit/webhooks', () => ({
  Webhooks: vi.fn(function () {
    return { verify: mocks.verify };
  }),
}));

vi.mock('next/headers', () => ({
  headers: () => ({
    get: (key: string) => {
      if (key === 'x-hub-signature-256') return 'sha256=testsignature';
      if (key === 'x-github-event') return 'push';
      if (key === 'x-github-delivery') return 'delivery-123';
      return null;
    },
  }),
}));

vi.mock('../lib/supabase/admin', () => ({
  supabaseAdmin: {
    channel: vi.fn((name: string) => ({
      send: (...args: any[]) => mocks.send(name, ...args),
    })),
  },
}));

vi.mock('../lib/services/events', () => ({
  saveGithubEvent: (...args: any[]) => mocks.saveGithubEvent(...args),
}));

vi.mock('../lib/github/webhooks/dispatcher', () => ({
  dispatchEvent: (...args: any[]) => mocks.dispatchEvent(...args),
}));

describe('GitHub Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveGithubEvent.mockResolvedValue('saved');
    mocks.send.mockResolvedValue('ok');
    mocks.dispatchEvent.mockReturnValue({
      type: 'push',
      title: 'Push',
      description: 'tester: commit',
      repo: 'test/repo',
      meta: {},
    });
  });

  it('returns 401 if signature is invalid', async () => {
    mocks.verify.mockResolvedValue(false);

    const { POST } = await import('../app/api/webhooks/github/route');
    const req = new Request('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      body: JSON.stringify({ test: 'payload' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('processes valid webhook and broadcasts to owner channel', async () => {
    mocks.verify.mockResolvedValue(true);

    const payload = {
      repository: { full_name: 'test/repo', owner: { login: 'test-owner' } },
      pusher: { name: 'tester' },
      ref: 'refs/heads/main',
      head_commit: { message: 'test commit' },
      commits: [{}],
    };

    const { POST } = await import('../app/api/webhooks/github/route');
    const req = new Request('http://localhost:3000/api/webhooks/github', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mocks.saveGithubEvent).toHaveBeenCalledWith(
      expect.objectContaining({ repoOwner: 'test-owner' }),
      'delivery-123'
    );
    expect(mocks.send).toHaveBeenCalledWith(
      'github-updates:test-owner',
      expect.objectContaining({ type: 'broadcast', event: 'event' })
    );
  });
});
