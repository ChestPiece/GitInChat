
import { describe, it, expect, vi } from 'vitest';
import { POST } from '../app/api/webhooks/github/route';

// Mock Webhooks
const mocks = vi.hoisted(() => ({
  verify: vi.fn()
}));

vi.mock('@octokit/webhooks', () => ({
  Webhooks: vi.fn(function() {
    return { verify: mocks.verify };
  })
}));

// Mock Headers
vi.mock('next/headers', () => ({
  headers: () => ({
    get: (key: string) => {
        if (key === 'x-hub-signature-256') return 'sha256=testsignature';
        if (key === 'x-github-event') return 'push';
        return null;
    }
  })
}));

// Mock Supabase
const mockSend = vi.fn();
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    channel: () => ({
      send: mockSend
    })
  })
}));


describe('GitHub Webhook Handler', () => {
    it('should return 401 if signature is invalid', async () => {
        mocks.verify.mockResolvedValue(false); // Invalid signature
        
        const req = new Request('http://localhost:3000/api/webhooks/github', {
            method: 'POST',
            body: JSON.stringify({ test: 'payload' })
        });

        const res = await POST(req);
        expect(res.status).toBe(401);
    });

    it('should process event and return 200 if signature is valid', async () => {
        mocks.verify.mockResolvedValue(true); // Valid signature
        mockSend.mockResolvedValue({ error: null });

        const payload = {
            repository: { full_name: 'test/repo' },
            pusher: { name: 'tester' },
            ref: 'refs/heads/main',
            head_commit: { message: 'test commit' },
            commits: [{}]
        };

        const req = new Request('http://localhost:3000/api/webhooks/github', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const res = await POST(req);
        expect(res.status).toBe(200);
        
        // Should attempt to broadcast
        expect(mockSend).toHaveBeenCalled();
    });
});
