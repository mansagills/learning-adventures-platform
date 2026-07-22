import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock auth — treat caller as an authenticated ADMIN
vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockResolvedValue({
    apiUser: { id: 'u1', role: 'ADMIN' },
    error: null,
  }),
}));

// Mock the filesystem so we can inspect what gets written back.
// vi.hoisted ensures these exist when the (hoisted) vi.mock factory runs.
const { writeFileMock, readFileMock } = vi.hoisted(() => ({
  writeFileMock: vi.fn().mockResolvedValue(undefined),
  readFileMock: vi
    .fn()
    .mockResolvedValue('const mathGames: Adventure[] = [\n];\n'),
}));
vi.mock('fs/promises', () => {
  const fsMock = { readFile: readFileMock, writeFile: writeFileMock };
  return { ...fsMock, default: fsMock };
});

import { POST } from '@/app/api/internal/update-catalog/route';

function makeRequest(metadata: unknown): NextRequest {
  return new NextRequest('http://localhost/api/internal/update-catalog', {
    method: 'POST',
    body: JSON.stringify({ metadata }),
    headers: { 'Content-Type': 'application/json' },
  });
}

const baseMeta = {
  id: 'safe-id',
  title: 'Title',
  description: 'A description',
  type: 'game',
  category: 'math',
  gradeLevel: ['3', '4'],
  difficulty: 'easy',
  skills: ['addition'],
  estimatedTime: '10 min',
};

describe('Security: SSTI/RCE in update-catalog', () => {
  beforeEach(() => writeFileMock.mockClear());

  it('neutralizes a string-breakout / code-injection payload', async () => {
    // A malicious title that tries to break out of the string literal and
    // inject a new TS property / arbitrary code into catalogData.ts.
    const payload = 'pwned",\n  isAdmin: true,\n  evil: (() => {})(),\n  x: "';

    const res = await POST(makeRequest({ ...baseMeta, title: payload }));
    expect(res.status).toBe(200);

    const written = writeFileMock.mock.calls[0][1] as string;

    // The payload must survive only as escaped string DATA, never as code.
    // No line should become a bare `isAdmin: true` / `evil:` property.
    expect(written).not.toMatch(/^\s*isAdmin: true/m);
    expect(written).not.toMatch(/^\s*evil:/m);
    // The quote in the payload must be escaped (JSON.stringify behavior).
    expect(written).toContain('\\"');
  });

  it('rejects an invalid category (array-name injection vector)', async () => {
    const res = await POST(
      makeRequest({ ...baseMeta, category: 'math); doEvil(' })
    );
    expect(res.status).toBe(400);
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it('rejects an invalid id', async () => {
    const res = await POST(makeRequest({ ...baseMeta, id: '../../etc/passwd' }));
    expect(res.status).toBe(400);
    expect(writeFileMock).not.toHaveBeenCalled();
  });
});
