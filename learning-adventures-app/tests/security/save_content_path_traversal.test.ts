import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import path from 'path';
import { getServerSession } from 'next-auth/next';

// Mock next-auth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn().mockResolvedValue({
    user: {
      name: 'Admin',
      email: 'admin@example.com',
      role: 'ADMIN',
    },
  }),
}));

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

import { POST } from '@/app/api/internal/save-content/route';

const { writeFileMock, mkdirMock } = vi.hoisted(() => ({
  writeFileMock: vi.fn(),
  mkdirMock: vi.fn(),
}));

// Mock fs/promises and fs
vi.mock('fs/promises', () => {
  return {
    writeFile: writeFileMock,
    mkdir: mkdirMock,
    copyFile: vi.fn(),
    readdir: vi.fn(),
    default: {
      writeFile: writeFileMock,
      mkdir: mkdirMock,
      copyFile: vi.fn(),
      readdir: vi.fn(),
    },
  };
});

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  default: {
    existsSync: vi.fn().mockReturnValue(true),
  },
}));

// Mock AdmZip
const mockExtractAllTo = vi.fn();
const mockGetData = vi.fn().mockReturnValue(Buffer.from('content'));

// Define entries
const safeEntry = {
  entryName: 'index.html',
  isDirectory: false,
  getData: mockGetData,
};

const mockGetEntries = vi.fn().mockReturnValue([safeEntry]);

vi.mock('adm-zip', () => {
  return {
    default: class MockAdmZip {
      constructor(path: string) {}
      extractAllTo = mockExtractAllTo;
      getEntries = mockGetEntries;
    },
  };
});

// Mock Auth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Import after mocking
import { POST } from '@/app/api/internal/save-content/route';

describe('Security: Filename Path Traversal in save-content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({
      user: {
        role: 'ADMIN',
      },
    });
  });

  it('should prevent path traversal via fileName parameter', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: '../../../../../../tmp/evil.html', // Malicious filename
          type: 'game',
          subscriptionTier: 'free',
          uploadSource: 'uploaded',
          uploadedZipPath: 'uploads/temp/test.zip',
        }),
      }
    );

    const res = await POST(req);

    // Should return 400 Bad Request
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid file name. Path traversal detected./);

    const mkdirCalls = mkdirMock.mock.calls;
    console.log('mkdir calls:', mkdirCalls);

    // Ensure no directories were created
    expect(mkdirCalls.length).toBe(0);
  });

  it('should allow valid fileName', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'safe-game.html',
          type: 'game',
          subscriptionTier: 'free',
          uploadSource: 'uploaded',
          uploadedZipPath: '/uploads/temp/test.zip',
        }),
      }
    );

    const res = await POST(req);

    // Should return success (or at least proceed past validation)
    // Note: Since we mocked everything, it might succeed or fail later, but status shouldn't be 400 due to validation
    if (res.status === 400) {
      const json = await res.json();
      console.log('Error:', json);
    }
    expect(res.status).not.toBe(400);

    const mkdirCalls = mkdirMock.mock.calls;
    // Should have created directory
    expect(mkdirCalls.length).toBeGreaterThan(0);
  });
});
