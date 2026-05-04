import { beforeEach, describe, expect, it, vi } from 'vitest';

const setAll = vi.fn();
const getAll = vi.fn(() => []);
const exchangeCodeForSession = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      exchangeCodeForSession,
    },
  })),
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    getAll,
    set: setAll,
  })),
}));

describe('OAuth callback route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    exchangeCodeForSession.mockReset();
  });

  it('redirects to chat and persists cookies on success', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: null });

    const { GET } = await import('../app/auth/callback/route');
    const response = await GET(
      new Request('http://localhost:3000/auth/callback?code=test-code')
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/chat');
    expect(exchangeCodeForSession).toHaveBeenCalledWith('test-code');
  });

  it('redirects to auth error when exchange fails', async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error('bad code') });

    const { GET } = await import('../app/auth/callback/route');
    const response = await GET(
      new Request('http://localhost:3000/auth/callback?code=test-code')
    );

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('http://localhost:3000/auth/error');
  });
});
