import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/internal/update-catalog/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    readFile: vi.fn().mockResolvedValue('const testGames: Adventure[] = [];'),
    writeFile: vi.fn().mockResolvedValue(undefined),
  };
});

describe('Security: Update Catalog Authorization', () => {
  it('should reject unauthenticated requests', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: { category: 'test', type: 'game', gradeLevel: [], skills: [] } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should reject requests from non-admin users', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'STUDENT', id: '1' } });

    const req = new NextRequest('http://localhost/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: { category: 'test', type: 'game', gradeLevel: [], skills: [] } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should allow requests from admin users', async () => {
    vi.mocked(getServerSession).mockResolvedValue({ user: { role: 'ADMIN', id: '1' } });

    const req = new NextRequest('http://localhost/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: { category: 'test', type: 'game', gradeLevel: [], skills: [] } }),
    });

    const res = await POST(req);
    // Note: It might fail further down due to missing mock data setup in the file mock, but the status should not be 401.
    // In our file mock we have 'const testGames: Adventure[] = [];', it'll match the regex or fail with 500 if not matched properly, but not 401.
    expect(res.status).not.toBe(401);
  });
});
