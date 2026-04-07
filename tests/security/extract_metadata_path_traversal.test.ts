import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockGetEntries = vi.fn().mockReturnValue([]);

vi.mock('adm-zip', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      getEntries: mockGetEntries,
    })),
  };
});

vi.mock('next-auth', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      role: 'ADMIN',
    },
  }),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

import { POST } from '@/app/api/internal/extract-metadata/route';
import AdmZip from 'adm-zip';
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

    const res = await POST(req);
    const data = await res.json();

    // Verify if it correctly blocked the request
    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Invalid path|traversal/i);

    // Ensure AdmZip was not instantiated with malicious path
    const calls = vi.mocked(AdmZip).mock.calls;
    if (calls.length > 0) {
      const calledPath = calls[0][0] as string;
      expect(calledPath).not.toContain('etc/passwd');
    }
  });
});
