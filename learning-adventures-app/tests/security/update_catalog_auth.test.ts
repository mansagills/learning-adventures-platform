import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/internal/update-catalog/route';

const { mocks } = vi.hoisted(() => ({
  mocks: {
    getServerSession: vi.fn(),
    writeFile: vi.fn(),
    readFile: vi.fn().mockResolvedValue(`
export const mathGames: Adventure[] = [
];
`),
  },
}));

vi.mock('next-auth/next', () => ({
  getServerSession: mocks.getServerSession,
}));

vi.mock('fs/promises', () => ({
  readFile: mocks.readFile,
  writeFile: mocks.writeFile,
  default: {
    readFile: mocks.readFile,
    writeFile: mocks.writeFile,
  },
}));

describe('Update Catalog Authentication Security', () => {
  const mockMetadata = {
    id: 'test-game',
    title: 'Test Game',
    description: 'A test game',
    type: 'game',
    category: 'math',
    gradeLevel: ['3', '4'],
    difficulty: 'medium',
    skills: ['addition'],
    estimatedTime: '15 mins',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests', async () => {
    mocks.getServerSession.mockResolvedValueOnce(null);

    const req = new NextRequest('http://localhost:3000/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: mockMetadata }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized. Admin or Teacher role required.');

    expect(mocks.writeFile).not.toHaveBeenCalled();
  });

  it('rejects unauthorized users (e.g. STUDENT)', async () => {
    mocks.getServerSession.mockResolvedValueOnce({
      user: { role: 'STUDENT', id: 'student-123' },
    });

    const req = new NextRequest('http://localhost:3000/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: mockMetadata }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error).toBe('Unauthorized. Admin or Teacher role required.');

    expect(mocks.writeFile).not.toHaveBeenCalled();
  });

  it('allows authorized users (e.g. ADMIN)', async () => {
    mocks.getServerSession.mockResolvedValueOnce({
      user: { role: 'ADMIN', id: 'admin-123' },
    });

    const req = new NextRequest('http://localhost:3000/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: mockMetadata }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);

    expect(mocks.writeFile).toHaveBeenCalled();
  });

  it('allows authorized users (e.g. TEACHER)', async () => {
    mocks.getServerSession.mockResolvedValueOnce({
      user: { role: 'TEACHER', id: 'teacher-123' },
    });

    const req = new NextRequest('http://localhost:3000/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: mockMetadata }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);

    expect(mocks.writeFile).toHaveBeenCalled();
  });
});