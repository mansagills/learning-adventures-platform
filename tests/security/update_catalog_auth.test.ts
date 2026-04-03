import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

// 1. Mock dependencies BEFORE importing the module under test
const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

// Mock next-auth/next
vi.mock('next-auth/next', () => ({
  getServerSession: mocks.getServerSession,
}));

// Mock @/lib/auth
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  readFile: mocks.readFile,
  writeFile: mocks.writeFile,
  default: {
    readFile: mocks.readFile,
    writeFile: mocks.writeFile,
  },
}));

// 2. Import the module under test AFTER mocks
import { POST } from '../../app/api/internal/update-catalog/route';

describe('Security: Update Catalog Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401 if unauthenticated', async () => {
    mocks.getServerSession.mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost:3000/api/internal/update-catalog',
      {
        method: 'POST',
        body: JSON.stringify({ metadata: { category: 'math', type: 'game' } }),
      }
    );

    const response = await POST(req);

    expect(response.status).toBe(401);
    expect(mocks.readFile).not.toHaveBeenCalled();
    expect(mocks.writeFile).not.toHaveBeenCalled();

    const data = await response.json();
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 401 if user is STUDENT', async () => {
    mocks.getServerSession.mockResolvedValue({
      user: { role: 'STUDENT' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/update-catalog',
      {
        method: 'POST',
        body: JSON.stringify({ metadata: { category: 'math', type: 'game' } }),
      }
    );

    const response = await POST(req);

    expect(response.status).toBe(401);
    expect(mocks.readFile).not.toHaveBeenCalled();
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });

  it('should proceed if user is ADMIN', async () => {
    mocks.getServerSession.mockResolvedValue({
      user: { role: 'ADMIN' },
    });

    // Mock the catalog content so we don't throw an error later in the file
    mocks.readFile.mockResolvedValue(`const mathGames: Adventure[] = [];`);
    mocks.writeFile.mockResolvedValue(undefined);

    const req = new NextRequest(
      'http://localhost:3000/api/internal/update-catalog',
      {
        method: 'POST',
        body: JSON.stringify({
          metadata: {
            id: 'test',
            title: 'test',
            category: 'math',
            type: 'game',
            gradeLevel: ['1'],
            difficulty: 'easy',
            skills: ['math'],
            estimatedTime: '5m',
          },
        }),
      }
    );

    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mocks.readFile).toHaveBeenCalled();
  });

  it('should proceed if user is TEACHER', async () => {
    mocks.getServerSession.mockResolvedValue({
      user: { role: 'TEACHER' },
    });

    // Mock the catalog content so we don't throw an error later in the file
    mocks.readFile.mockResolvedValue(`const mathGames: Adventure[] = [];`);
    mocks.writeFile.mockResolvedValue(undefined);

    const req = new NextRequest(
      'http://localhost:3000/api/internal/update-catalog',
      {
        method: 'POST',
        body: JSON.stringify({
          metadata: {
            id: 'test',
            title: 'test',
            category: 'math',
            type: 'game',
            gradeLevel: ['1'],
            difficulty: 'easy',
            skills: ['math'],
            estimatedTime: '5m',
          },
        }),
      }
    );

    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mocks.readFile).toHaveBeenCalled();
  });
});
