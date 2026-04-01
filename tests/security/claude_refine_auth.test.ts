import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() };
});

vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class Anthropic {
      messages = {
        create: mockCreate,
      };
    },
  };
});

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

import { POST } from '../../app/api/internal/claude-refine/route';

describe('POST /api/internal/claude-refine', () => {
  const validBody = {
    type: 'game',
    subject: 'Math',
    concept: 'Addition',
    title: 'Adding Fun',
    gradeLevel: ['1'],
    difficulty: 'Easy',
    skills: ['counting'],
    estimatedTime: '10m',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Generated refinements' }],
      usage: { input_tokens: 10, output_tokens: 10 },
    });
  });

  it('should return 401 and NOT call API if unauthenticated', async () => {
    (getServerSession as any).mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost:3000/api/internal/claude-refine',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 401 and NOT call API if user is STUDENT', async () => {
    (getServerSession as any).mockResolvedValue({
      user: { role: 'STUDENT', email: 'student@example.com' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/claude-refine',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });

  it('should call API if user IS ADMIN', async () => {
    (getServerSession as any).mockResolvedValue({
      user: { role: 'ADMIN', email: 'admin@example.com' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/claude-refine',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    expect(mockCreate).toHaveBeenCalled();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.content).toBe('Generated refinements');
  });
});
