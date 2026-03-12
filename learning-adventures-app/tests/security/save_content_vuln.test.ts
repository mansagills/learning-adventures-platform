
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/internal/save-content/route';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  existsSync: vi.fn(),
}));

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    writeFile: mocks.writeFile,
    mkdir: mocks.mkdir,
  },
  writeFile: mocks.writeFile,
  mkdir: mocks.mkdir,
}));

// Mock fs
vi.mock('fs', () => ({
  default: {
    existsSync: mocks.existsSync,
  },
  existsSync: mocks.existsSync,
}));

// Mock next-auth/next
vi.mock('next-auth/next', () => ({
  getServerSession: mocks.getServerSession,
}));

// Mock authOptions (just an object)
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('Save Content Vulnerability Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks
    mocks.writeFile.mockResolvedValue(undefined);
    mocks.mkdir.mockResolvedValue(undefined);
    mocks.existsSync.mockReturnValue(true);
  });

  it('rejects unauthenticated requests', async () => {
    mocks.getServerSession.mockResolvedValue(null);

    const req = new NextRequest('http://localhost:3000/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        content: '<h1>Test</h1>',
        fileName: 'test.html',
        type: 'game',
        subscriptionTier: 'free',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });

  it('rejects unauthorized users (e.g. STUDENT)', async () => {
    mocks.getServerSession.mockResolvedValue({
      user: { role: 'STUDENT' },
    });

    const req = new NextRequest('http://localhost:3000/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        content: '<h1>Test</h1>',
        fileName: 'test.html',
        type: 'game',
        subscriptionTier: 'free',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(401);
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });

  it('rejects path traversal attempts from authorized users', async () => {
    mocks.getServerSession.mockResolvedValue({
      user: { role: 'ADMIN' },
    });

    const maliciousFileName = '../../../../tmp/hacked.html';

    const req = new NextRequest('http://localhost:3000/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        content: '<h1>Hacked</h1>',
        fileName: maliciousFileName,
        type: 'game',
        subscriptionTier: 'free',
      }),
    });

    const response = await POST(req);

    // Expect 400 Bad Request due to path traversal detection
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Path traversal detected');

    expect(mocks.writeFile).not.toHaveBeenCalled();
  });

  it('allows valid requests from authorized users', async () => {
    mocks.getServerSession.mockResolvedValue({
      user: { role: 'ADMIN' },
    });

    const validFileName = 'test_game.html';

    const req = new NextRequest('http://localhost:3000/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        content: '<h1>Valid Game</h1>',
        fileName: validFileName,
        type: 'game',
        subscriptionTier: 'free',
      }),
    });

    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(mocks.writeFile).toHaveBeenCalled();

    const filePathArg = mocks.writeFile.mock.calls[0][0] as string;
    expect(filePathArg).toContain(validFileName);
    expect(filePathArg).not.toContain('..');
  });
});
