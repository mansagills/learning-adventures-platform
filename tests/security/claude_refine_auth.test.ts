import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// 1. Mock dependencies BEFORE importing the module under test
const { mockCreate } = vi.hoisted(() => {
  return { mockCreate: vi.fn() };
});

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class Anthropic {
      messages = {
        create: mockCreate,
      };
    },
  };
});

// Mock @/lib/api-auth
vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi
    .fn()
    .mockResolvedValue({ apiUser: null, error: { status: 401 } as any }),
}));

// Mock @/lib/auth (to avoid prisma issues)
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// 2. Import the module under test AFTER mocks
import { POST } from '../../app/api/internal/claude-refine/route';
import { getApiUser } from '@/lib/api-auth';

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

    // Default mock behavior for Anthropic
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Generated content' }],
      usage: { input_tokens: 10, output_tokens: 10 },
    });
  });

  it('should return 401 and NOT call Anthropic API if unauthenticated', async () => {
    // Mock no session
    vi.mocked(getApiUser).mockResolvedValue({
      apiUser: null,
      error: { status: 401 } as any,
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/claude-refine',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    // VERIFY FIX: API should NOT be called
    expect(mockCreate).not.toHaveBeenCalled();
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 403 and NOT call Anthropic API if user is not ADMIN or TEACHER', async () => {
    // Mock student session
    vi.mocked(getApiUser).mockResolvedValue({
      apiUser: { role: 'STUDENT', email: 'student@example.com' } as any,
      error: null,
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/claude-refine',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    // VERIFY FIX: API should NOT be called
    expect(mockCreate).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });

  it('should call Anthropic API if user IS ADMIN', async () => {
    // Mock admin session
    vi.mocked(getApiUser).mockResolvedValue({
      apiUser: { role: 'ADMIN', email: 'admin@learningadventures.org' } as any,
      error: null,
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/claude-refine',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    // Should pass
    expect(mockCreate).toHaveBeenCalled();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.content).toBe('Generated content');
  });

  it('should call Anthropic API if user IS TEACHER', async () => {
    // Mock teacher session
    vi.mocked(getApiUser).mockResolvedValue({
      apiUser: {
        role: 'TEACHER',
        email: 'teacher@learningadventures.org',
      } as any,
      error: null,
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/claude-refine',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    // Should pass
    expect(mockCreate).toHaveBeenCalled();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.content).toBe('Generated content');
  });
});
