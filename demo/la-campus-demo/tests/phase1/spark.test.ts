import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── SPARK system prompt ─────────────────────────────────────────────────────

describe('SPARK system prompt', () => {
  it('contains the SPARK persona definition', async () => {
    const { SPARK_SYSTEM_PROMPT } = await import('@/lib/agents/sparkPrompt');
    expect(SPARK_SYSTEM_PROMPT).toContain('SPARK');
    expect(SPARK_SYSTEM_PROMPT).toContain('K-12');
  });

  it('includes the no-homework rule', async () => {
    const { SPARK_SYSTEM_PROMPT } = await import('@/lib/agents/sparkPrompt');
    expect(SPARK_SYSTEM_PROMPT).toContain('NEVER do homework');
  });

  it('includes campus building references', async () => {
    const { SPARK_SYSTEM_PROMPT } = await import('@/lib/agents/sparkPrompt');
    expect(SPARK_SYSTEM_PROMPT).toContain('Math Building');
    expect(SPARK_SYSTEM_PROMPT).toContain('Science Building');
  });
});

// ─── SPARK chat API route ────────────────────────────────────────────────────

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: vi.fn().mockResolvedValue({
          [Symbol.asyncIterator]: async function* () {
            yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Hey Explorer! ' } };
            yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Great question!' } };
          },
        }),
      };
    },
  };
});

describe('POST /api/agents/spark/chat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 for unauthenticated requests', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const { POST } = await import('@/app/api/agents/spark/chat/route');
    const req = new Request('http://localhost/api/agents/spark/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Hello' }] }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
  });

  it('returns 400 for empty messages array', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'user-1', name: 'Test' },
      expires: '9999',
    });

    const { POST } = await import('@/app/api/agents/spark/chat/route');
    const req = new Request('http://localhost/api/agents/spark/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [] }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
  });

  it('returns a streaming response for valid authenticated requests', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'user-1', name: 'Test Student' },
      expires: '9999',
    });

    const { POST } = await import('@/app/api/agents/spark/chat/route');
    const req = new Request('http://localhost/api/agents/spark/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'What is 2+2?' }] }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('text/plain');
  });
});
