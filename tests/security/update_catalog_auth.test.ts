import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
// Import getServerSession from the mock source
import { getServerSession } from 'next-auth/next';

// Mock fs/promises before importing the route to prevent actual file ops
vi.mock('fs/promises', () => {
  return {
    readFile: vi.fn().mockResolvedValue('const testGames: Adventure[] = [];\n'),
    writeFile: vi.fn().mockResolvedValue(undefined),
    default: {
      readFile: vi
        .fn()
        .mockResolvedValue('const testGames: Adventure[] = [];\n'),
      writeFile: vi.fn().mockResolvedValue(undefined),
    },
  };
});

// Mock next-auth/next
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue(null),
}));

// Mock @/lib/auth
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Import the module under test AFTER mocks
import { POST } from '../../app/api/internal/update-catalog/route';
import { readFile, writeFile } from 'fs/promises';

describe('POST /api/internal/update-catalog', () => {
  const validBody = {
    metadata: {
      id: 'test-game',
      title: 'Test Game',
      description: 'A test game',
      type: 'game',
      category: 'test',
      gradeLevel: ['1'],
      difficulty: 'Easy',
      skills: ['testing'],
      estimatedTime: '5m',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 and NOT modify catalog if unauthenticated', async () => {
    // Mock no session
    (getServerSession as any).mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost:3000/api/internal/update-catalog',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    // VERIFY FIX: File should NOT be read or written
    expect(readFile).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
    expect(response.status).toBe(401);

    const data = await response.json();
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 401 and NOT modify catalog if user is STUDENT', async () => {
    // Mock student session
    (getServerSession as any).mockResolvedValue({
      user: { role: 'STUDENT', email: 'student@example.com' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/update-catalog',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    // VERIFY FIX: File should NOT be read or written
    expect(readFile).not.toHaveBeenCalled();
    expect(writeFile).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
  });

  it('should not return 401 if user IS ADMIN', async () => {
    // Mock admin session
    (getServerSession as any).mockResolvedValue({
      user: { role: 'ADMIN', email: 'admin@learningadventures.org' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/update-catalog',
      {
        method: 'POST',
        body: JSON.stringify(validBody),
      }
    );

    const response = await POST(req);

    // Note: Since readFile throws an error during the mocked regex process internally, it might return 500.
    // However, it passed the 401 auth gate.
    expect(response.status).not.toBe(401);
  });
});
