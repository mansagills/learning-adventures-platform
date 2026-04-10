import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

// Mock fs/promises and path
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
}));

// Mock AdmZip
const { mockGetEntries, MockAdmZip } = vi.hoisted(() => {
  const mockGetEntries = vi.fn().mockReturnValue([]);
  const MockAdmZip = vi.fn().mockImplementation(() => {
    return {
      getEntries: mockGetEntries,
    };
  });
  return { mockGetEntries, MockAdmZip };
});


vi.mock('adm-zip', () => {
  return {
    default: MockAdmZip,
  };
});

// Mock Auth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockResolvedValue({
    apiUser: {
      id: 'admin-id',
      role: 'ADMIN'
    }
  })
}));

// Import after mocking
import { POST } from '@/app/api/internal/extract-metadata/route';
import path from 'path';

describe('Security: Path Traversal in extract-metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent path traversal via zipPath parameter', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/internal/extract-metadata',
      {
        method: 'POST',
        body: JSON.stringify({
          zipPath: '../../../../etc/passwd',
        }),
      }
    );

    const response = await POST(req);
    const data = await response.json();

    // We expect the API to either reject it with 400 or use a safe path
    if (response.status === 400) {
      expect(data.error).toMatch(/path traversal|Invalid/i);
    } else {
      // If it doesn't return 400, it shouldn't pass malicious path to AdmZip
      const passedPath = MockAdmZip.mock.calls[0][0];
      const publicDir = path.join(process.cwd(), 'public');

      // The resolved path must be within the public directory
      const isWithinPublic = passedPath.startsWith(publicDir + path.sep) || passedPath === publicDir;
      expect(isWithinPublic).toBe(true);
    }
  });
});
