import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/internal/extract-metadata/route';
import { NextRequest } from 'next/server';

const { mockGetServerSession } = vi.hoisted(() => ({
  mockGetServerSession: vi.fn(),
}));

// Mock next-auth/next
vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
}));

// Mock authOptions (just an object)
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('adm-zip', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        getEntries: () => []
      };
    })
  };
});

describe('Security: Extract Metadata Path Traversal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetServerSession.mockResolvedValue({
      user: { role: 'ADMIN', id: 'admin' },
    });
  });

  it('should block path traversal in zipPath parameter', async () => {
    const maliciousPath = '../../../../etc/passwd';

    const req = new NextRequest('http://localhost:3000/api/internal/extract-metadata', {
      method: 'POST',
      body: JSON.stringify({
        zipPath: maliciousPath,
      }),
    });

    const response = await POST(req);

    // Expect 400 Bad Request due to path traversal detection
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Path traversal detected');
  });

});
