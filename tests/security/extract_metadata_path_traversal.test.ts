import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import path from 'path';

// Hoist mocks
const { existsSyncMock, getEntriesMock } = vi.hoisted(() => ({
  existsSyncMock: vi.fn().mockReturnValue(true),
  getEntriesMock: vi.fn().mockReturnValue([]),
}));

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: existsSyncMock,
  default: {
    existsSync: existsSyncMock,
  },
}));

vi.mock('adm-zip', () => {
  return {
    default: class MockAdmZip {
      constructor(path: string) {}
      getEntries = getEntriesMock;
    },
  };
});

vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockResolvedValue({
    apiUser: { role: 'ADMIN', id: 'test-admin' },
    error: null,
  }),
}));

import { POST } from '@/app/api/internal/extract-metadata/route';

describe('Security: Path Traversal in extract-metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent path traversal in zipPath', async () => {
    const maliciousPath = '../../../../etc/passwd';
    const req = new NextRequest(
      'http://localhost:3000/api/internal/extract-metadata',
      {
        method: 'POST',
        body: JSON.stringify({
          zipPath: maliciousPath,
        }),
      }
    );

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Invalid path\. Path traversal detected\./i);
  });

  it('should allow valid path in zipPath', async () => {
    const validPath = 'uploads/test.zip';
    const req = new NextRequest(
      'http://localhost:3000/api/internal/extract-metadata',
      {
        method: 'POST',
        body: JSON.stringify({
          zipPath: validPath,
        }),
      }
    );

    const res = await POST(req);

    // Because it's fully mocked and valid, we just want to ensure it passes the traversal check
    // The status should not be 400
    expect(res.status).toBe(200);
  });
});
