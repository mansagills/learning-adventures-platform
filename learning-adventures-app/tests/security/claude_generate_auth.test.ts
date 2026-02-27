import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-auth/next
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

// Mock @anthropic-ai/sdk
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: 'text', text: '<html>Generated Content</html>' }],
        }),
      },
    })),
  };
});

// Import the route handler
import { POST } from '@/app/api/internal/claude-generate/route';
import { getServerSession } from 'next-auth/next';

describe('Claude Generate API Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
  });

  it('should reject unauthenticated requests', async () => {
    // Mock unauthenticated session
    vi.mocked(getServerSession).mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/internal/claude-generate',
      {
        method: 'POST',
        body: JSON.stringify({
          formData: {
            type: 'game',
            subject: 'Math',
            concept: 'Addition',
            title: 'Math Game',
            gradeLevel: ['1'],
            skills: ['Addition'],
            estimatedTime: '10 mins',
            difficulty: 'Easy',
          },
        }),
      }
    );

    const response = await POST(request);

    // Expect 401 Unauthorized
    expect(response.status).toBe(401);
  });

  it('should allow authenticated ADMIN requests', async () => {
    // Mock authenticated ADMIN session
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        name: 'Admin User',
        email: 'admin@learningadventures.org',
        role: 'ADMIN',
      },
      expires: '1',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/internal/claude-generate',
      {
        method: 'POST',
        body: JSON.stringify({
          formData: {
            type: 'game',
            subject: 'Math',
            concept: 'Addition',
            title: 'Math Game',
            gradeLevel: ['1'],
            skills: ['Addition'],
            estimatedTime: '10 mins',
            difficulty: 'Easy',
          },
        }),
      }
    );

    const response = await POST(request);

    // Expect 200 OK
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.content).toBe('<html>Generated Content</html>');
  });

  it('should reject authenticated STUDENT requests', async () => {
    // Mock authenticated STUDENT session
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        name: 'Student User',
        email: 'student@example.com',
        role: 'STUDENT',
      },
      expires: '1',
    });

    const request = new NextRequest(
      'http://localhost:3000/api/internal/claude-generate',
      {
        method: 'POST',
        body: JSON.stringify({
          formData: {
            type: 'game',
            subject: 'Math',
            concept: 'Addition',
            title: 'Math Game',
            gradeLevel: ['1'],
            skills: ['Addition'],
            estimatedTime: '10 mins',
            difficulty: 'Easy',
          },
        }),
      }
    );

    const response = await POST(request);

    // Expect 401 Unauthorized
    expect(response.status).toBe(401);
  });
});
