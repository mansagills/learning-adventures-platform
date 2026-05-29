import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
// Import getServerSession from the mock source
import { getServerSession } from 'next-auth/next';

// 1. Mock dependencies BEFORE importing the module under test
const { mockCreate, mockGetServerSession } = vi.hoisted(() => {
  return {
    mockCreate: vi.fn(),
    mockGetServerSession: vi.fn()
  };
});

vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockImplementation(async () => {
    const session = await mockGetServerSession();
    if (!session?.user) return { apiUser: null, error: new Response(null, { status: 401 }) };
    return {
      apiUser: session.user,
      error: null
    };
  })
}));

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class Anthropic {
      messages = {
        create: mockCreate
      }
    }
  };
});

// Mock next-auth/next (simulating auth functions)
vi.mock('next-auth/next', () => ({
  getServerSession: mockGetServerSession,
}));

// Mock @/lib/auth (to avoid prisma issues)
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// 2. Import the module under test AFTER mocks
import { POST } from '../../app/api/internal/claude-generate/route';

describe('POST /api/internal/claude-generate', () => {
  const validBody = {
      formData: {
          type: 'game',
          subject: 'Math',
          concept: 'Addition',
          title: 'Adding Fun',
          gradeLevel: ['1'],
          difficulty: 'Easy',
          skills: ['counting'],
          estimatedTime: '10m'
      }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';

    // Default mock behavior for Anthropic
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Generated content' }]
    });
  });

  it('should return 403 and NOT call Anthropic API if unauthenticated', async () => {
    // Mock no session
    mockGetServerSession.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/internal/claude-generate', {
        method: 'POST',
        body: JSON.stringify(validBody)
    });

    const response = await POST(req);

    // VERIFY FIX: API should NOT be called
    expect(mockCreate).not.toHaveBeenCalled();
    expect(response.status).toBe(403);

    const data = await response.json();
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 403 and NOT call Anthropic API if user is not ADMIN', async () => {
    // Mock student session
    mockGetServerSession.mockResolvedValue({
      user: { role: 'STUDENT', email: 'student@example.com' }
    });

    const req = new NextRequest('http://localhost:3000/api/internal/claude-generate', {
        method: 'POST',
        body: JSON.stringify(validBody)
    });

    const response = await POST(req);

    // VERIFY FIX: API should NOT be called
    expect(mockCreate).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });

  it('should call Anthropic API if user IS ADMIN', async () => {
    // Mock admin session
    mockGetServerSession.mockResolvedValue({
      user: { role: 'ADMIN', email: 'admin@learningadventures.org' }
    });

    const req = new NextRequest('http://localhost:3000/api/internal/claude-generate', {
        method: 'POST',
        body: JSON.stringify(validBody)
    });

    const response = await POST(req);

    // Should pass
    expect(mockCreate).toHaveBeenCalled();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.content).toBe('Generated content');
  });
});
