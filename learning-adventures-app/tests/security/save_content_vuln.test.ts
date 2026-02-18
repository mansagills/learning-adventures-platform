import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/internal/save-content/route';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import * as fs from 'fs/promises';
import { join } from 'path';

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Mock fs/promises
vi.mock('fs/promises', () => {
  return {
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    copyFile: vi.fn(),
    readdir: vi.fn(),
    constants: {},
    default: {
      writeFile: vi.fn(),
      mkdir: vi.fn(),
      copyFile: vi.fn(),
      readdir: vi.fn(),
      constants: {},
    }
  };
});

// Mock fs
vi.mock('fs', () => {
  const existsSync = vi.fn(() => true);
  return {
    existsSync,
    default: {
      existsSync
    }
  };
});

describe('Security: save-content endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block unauthenticated requests', async () => {
    // Mock no session
    (getServerSession as any).mockResolvedValue(null);

    const req = new NextRequest('http://localhost/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        content: '<html></html>',
        fileName: 'test.html',
        type: 'game',
      }),
    });

    const res = await POST(req);

    // Expect 401 Unauthorized or 403 Forbidden
    // Currently this will likely succeed (200) because there's no check
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error).toMatch(/Unauthorized/i);
  });

  it('should block requests from non-admin/non-teacher users', async () => {
    // Mock student session
    (getServerSession as any).mockResolvedValue({
      user: { role: 'STUDENT', id: '123' },
    });

    const req = new NextRequest('http://localhost/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        content: '<html></html>',
        fileName: 'test.html',
        type: 'game',
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(403);
  });

  it('should prevent path traversal in fileName', async () => {
    // Mock admin session
    (getServerSession as any).mockResolvedValue({
      user: { role: 'ADMIN', id: 'admin' },
    });

    const req = new NextRequest('http://localhost/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        content: '<html>Malicious Content</html>',
        fileName: '../../../evil.html',
        type: 'game',
      }),
    });

    const res = await POST(req);

    // If vulnerability exists, it might return 200 or 500 but still call writeFile with bad path
    // We want 400 Bad Request
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid filename/i);

    // Verify writeFile was NOT called
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should prevent path traversal in uploadedZipPath', async () => {
    // Mock admin session
    (getServerSession as any).mockResolvedValue({
      user: { role: 'ADMIN', id: 'admin' },
    });

    const req = new NextRequest('http://localhost/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        fileName: 'safe.html',
        type: 'game',
        uploadSource: 'uploaded',
        uploadedZipPath: '../../../etc/passwd'
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid zip path/i);

    // Verify zip extraction logic was NOT reached
    // We can't easily mock AdmZip constructor here without more work,
    // but the 400 response confirms we stopped early.
  });
});
