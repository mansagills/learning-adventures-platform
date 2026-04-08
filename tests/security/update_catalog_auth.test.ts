import { NextRequest } from 'next/server';
import { POST } from '@/app/api/internal/update-catalog/route';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock next-auth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from 'next-auth/next';

// Mock fs/promises
const { readFileMock, writeFileMock } = vi.hoisted(() => ({
  readFileMock: vi.fn().mockResolvedValue('export const mathGames: Adventure[] = [];'),
  writeFileMock: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('fs/promises', () => ({
  default: {
    readFile: readFileMock,
    writeFile: writeFileMock,
  },
  readFile: readFileMock,
  writeFile: writeFileMock,
}));

describe('update-catalog route security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated requests with 403', async () => {
    (getServerSession as any).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: { category: 'math', type: 'game', id: '1' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/Unauthorized/);
  });

  it('rejects requests from non-admin/teacher roles with 403', async () => {
    (getServerSession as any).mockResolvedValue({ user: { role: 'STUDENT' } });

    const req = new NextRequest('http://localhost/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: { category: 'math', type: 'game', id: '1' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/Unauthorized/);
  });

  it('allows requests from ADMIN role', async () => {
    (getServerSession as any).mockResolvedValue({ user: { role: 'ADMIN' } });

    const req = new NextRequest('http://localhost/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: { category: 'math', type: 'game', id: '1', title: 'test', description: 'test', gradeLevel: ['3'], difficulty: 'EASY', skills: ['math'], estimatedTime: '10 min' } }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
