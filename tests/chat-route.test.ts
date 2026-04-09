import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Hoisted mocks ────────────────────────────────────────────────────────────
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  fromChats: vi.fn(),
  createMessage: vi.fn(),
  validateMessageSafety: vi.fn(),
  searchSimilarDocuments: vi.fn(),
  createAgentUIStreamResponse: vi.fn(),
}));

vi.mock('../lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getSession: mocks.getSession },
    from: (table: string) => {
      if (table === 'chats') return mocks.fromChats();
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), single: vi.fn() };
    },
  }),
}));

vi.mock('../lib/services/messages', () => ({
  createMessage: mocks.createMessage,
}));

vi.mock('../lib/safety', () => ({
  validateMessageSafety: mocks.validateMessageSafety,
}));

vi.mock('../lib/rag/search', () => ({
  searchSimilarDocuments: mocks.searchSimilarDocuments,
}));

vi.mock('ai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('ai')>();
  return {
    ...actual,
    createAgentUIStreamResponse: mocks.createAgentUIStreamResponse,
  };
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const makeSession = (overrides?: object) => ({
  user: { id: 'user-1', email: 'test@example.com' },
  provider_token: 'github-token-abc',
  ...overrides,
});

const makeRequest = (body: object) =>
  new Request('http://localhost/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('POST /api/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.validateMessageSafety.mockResolvedValue(null); // safe by default
    mocks.searchSimilarDocuments.mockResolvedValue([]); // no RAG context
    mocks.createMessage.mockResolvedValue(undefined);
    mocks.createAgentUIStreamResponse.mockReturnValue(new Response('ok', { status: 200 }));
  });

  it('returns 401 when there is no session', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } });
    const { POST } = await import('../app/api/chat/route');
    const res = await POST(makeRequest({ messages: [{ role: 'user', content: 'hi' }] }));
    expect(res.status).toBe(401);
  });

  it('returns 401 when session has no provider_token (GitHub token missing)', async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: makeSession({ provider_token: undefined }) },
    });
    const { POST } = await import('../app/api/chat/route');
    const res = await POST(makeRequest({ messages: [{ role: 'user', content: 'hi' }] }));
    expect(res.status).toBe(401);
    expect(await res.text()).toContain('GitHub token missing');
  });

  it('returns 403 when user does not own the chat', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: makeSession() } });
    mocks.fromChats.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { user_id: 'other-user' }, error: null }),
    });
    const { POST } = await import('../app/api/chat/route');
    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'hi' }], chatId: 'chat-123' })
    );
    expect(res.status).toBe(403);
  });

  it('returns 400 when safety check blocks the message', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: makeSession() } });
    mocks.fromChats.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null }),
    });
    mocks.validateMessageSafety.mockResolvedValue(
      new Response(JSON.stringify({ error: 'blocked', code: 'safety_violation' }), { status: 400 })
    );
    const { POST } = await import('../app/api/chat/route');
    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'do something bad' }], chatId: 'chat-123' })
    );
    expect(res.status).toBe(400);
  });

  it('injects RAG context as system message when docs are found', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: makeSession() } });
    mocks.fromChats.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null }),
    });
    mocks.searchSimilarDocuments.mockResolvedValue([
      { content: 'const x = 1;', similarity: 0.9, metadata: { repo_name: 'owner/repo', file_path: 'index.ts' } },
    ]);

    let capturedMessages: any;
    mocks.createAgentUIStreamResponse.mockImplementation(({ uiMessages }: any) => {
      capturedMessages = uiMessages;
      return new Response('ok');
    });

    const { POST } = await import('../app/api/chat/route');
    await POST(
      makeRequest({ messages: [{ role: 'user', content: 'what does index.ts do?' }], chatId: 'chat-123' })
    );

    expect(capturedMessages[0].role).toBe('system');
    expect(capturedMessages[0].content).toContain('Relevant Code Context');
  });

  it('proceeds (fail open) when RAG search throws', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: makeSession() } });
    mocks.fromChats.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null }),
    });
    mocks.searchSimilarDocuments.mockRejectedValue(new Error('pgvector down'));

    let capturedMessages: any;
    mocks.createAgentUIStreamResponse.mockImplementation(({ uiMessages }: any) => {
      capturedMessages = uiMessages;
      return new Response('ok');
    });

    const { POST } = await import('../app/api/chat/route');
    const res = await POST(
      makeRequest({ messages: [{ role: 'user', content: 'hello' }], chatId: 'chat-123' })
    );
    // Should still succeed despite RAG failure
    expect(res.status).toBe(200);
    // No system message injected
    expect(capturedMessages[0].role).toBe('user');
  });

  it('saves user message to DB on valid request', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: makeSession() } });
    mocks.fromChats.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null }),
    });

    const { POST } = await import('../app/api/chat/route');
    await POST(
      makeRequest({ messages: [{ role: 'user', content: 'list my repos' }], chatId: 'chat-123' })
    );

    expect(mocks.createMessage).toHaveBeenCalledWith(
      'chat-123', 'user', 'list my repos', expect.anything()
    );
  });

  it('does not save a second assistant message when onStepFinish fires without text', async () => {
    // onStepFinish with empty text should NOT call createMessage
    mocks.getSession.mockResolvedValue({ data: { session: makeSession() } });
    mocks.fromChats.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { user_id: 'user-1' }, error: null }),
    });

    let onStepFinishCallback: ((args: any) => Promise<void>) | undefined;
    mocks.createAgentUIStreamResponse.mockImplementation(({ onStepFinish }: any) => {
      onStepFinishCallback = onStepFinish;
      return new Response('ok');
    });

    const { POST } = await import('../app/api/chat/route');
    await POST(
      makeRequest({ messages: [{ role: 'user', content: 'hi' }], chatId: 'chat-123' })
    );

    // Simulate a tool-call-only step (no text)
    await onStepFinishCallback?.({ text: '', toolCalls: [{}] });
    const assistantSaves = mocks.createMessage.mock.calls.filter(c => c[1] === 'assistant');
    expect(assistantSaves.length).toBe(0);
  });
});
