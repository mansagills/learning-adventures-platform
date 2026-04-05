import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

const mockGetEntries = vi.fn().mockReturnValue([]);
vi.mock('adm-zip', () => {
  return {
    default: vi.fn().mockImplementation((path) => {
      // Record the path
      mockAdmZipConstructor(path);
      return {
        getEntries: mockGetEntries,
      };
    }),
  };
});

const mockAdmZipConstructor = vi.fn();

import { POST } from '@/app/api/internal/extract-metadata/route';
import path from 'path';

describe('extract-metadata Path Traversal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({
      user: { role: 'ADMIN' },
    });
  });

  it('should allow valid paths within public directory', async () => {
    const req = new NextRequest('http://localhost/api/internal/extract-metadata', {
      method: 'POST',
      body: JSON.stringify({ zipPath: 'uploads/temp/valid.zip' }),
    });

    await POST(req);
    expect(mockAdmZipConstructor).toHaveBeenCalled();
    const calledPath = mockAdmZipConstructor.mock.calls[0][0];

    // Should resolve within public
    expect(calledPath.includes('public/uploads/temp/valid.zip') || calledPath.includes('public\\uploads\\temp\\valid.zip')).toBe(true);
  });

  it('should block path traversal attempts', async () => {
    mockAdmZipConstructor.mockClear();

    const req = new NextRequest('http://localhost/api/internal/extract-metadata', {
      method: 'POST',
      body: JSON.stringify({ zipPath: '../../../../etc/passwd' }),
    });

    const res = await POST(req);

    // AdmZip should not be called
    expect(mockAdmZipConstructor).not.toHaveBeenCalled();

    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toContain('Path traversal detected');
  });
});
