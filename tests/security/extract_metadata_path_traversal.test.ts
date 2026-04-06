import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/internal/extract-metadata/route';
import { getServerSession } from 'next-auth';
import AdmZip from 'adm-zip';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock authOptions
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock AdmZip
vi.mock('adm-zip', () => {
  return {
    default: class MockAdmZip {
      constructor() {}
      getEntries() {
        return [];
      }
    },
  };
});

describe('POST /api/internal/extract-metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful authentication by default
    vi.mocked(getServerSession).mockResolvedValue({
      user: {
        id: '1',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
      expires: new Date(Date.now() + 86400).toISOString(),
    });
  });

  it('should reject path traversal attempts with 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost/api/internal/extract-metadata', {
      method: 'POST',
      body: JSON.stringify({
        zipPath: '../../../etc/passwd',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error).toContain('Invalid path. Path traversal detected.');
  });

  it('should reject path traversal attempts via explicit .. check', async () => {
      const req = new NextRequest('http://localhost/api/internal/extract-metadata', {
        method: 'POST',
        body: JSON.stringify({
          zipPath: 'uploads/temp/../../etc/passwd',
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('Invalid path. Path traversal detected.');
    });

  it('should treat absolute paths as relative to public directory', async () => {
    // In node, path.resolve with an absolute path ignores the base if not stripped.
    // The implementation strips the leading slash so it resolves within public.
    // If it wasn't stripped, it would resolve to /etc/passwd and the startsWith check would catch it.
    // So this should actually be a 200 success or we can test an unstripped absolute path if the implementation allows it.
    // But since the implementation strips leading slashes `replace(/^[\/\\]+/, '')`, it will successfully resolve to public/etc/passwd.
    const req = new NextRequest('http://localhost/api/internal/extract-metadata', {
      method: 'POST',
      body: JSON.stringify({
        zipPath: '/valid/game.zip',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);
  });

  it('should accept valid zip paths', async () => {
    const req = new NextRequest('http://localhost/api/internal/extract-metadata', {
      method: 'POST',
      body: JSON.stringify({
        zipPath: 'uploads/temp/my-game.zip',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
  });
});
