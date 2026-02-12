import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/internal/save-content/route';
import { NextRequest } from 'next/server';
import path from 'path';

// Mock fs/promises and fs
// We need to hoist mocks to use them in vi.mock
const { writeFileMock, mkdirMock } = vi.hoisted(() => ({
  writeFileMock: vi.fn(),
  mkdirMock: vi.fn(),
}));

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
const mockGetEntries = vi.fn().mockReturnValue([
  {
    entryName: 'index.html',
    isDirectory: false,
    getData: mockGetData,
  },
]);

vi.mock('adm-zip', () => {
  return {
    default: class MockAdmZip {
      constructor(path: string) {}
      extractAllTo = mockExtractAllTo;
      getEntries = mockGetEntries;
    },
  };
});

describe('Security: Filename Path Traversal in save-content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent path traversal via fileName parameter', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: '../../malicious/game.html',
          type: 'game',
          subscriptionTier: 'free',
          uploadSource: 'uploaded',
          uploadedZipPath: '/uploads/test.zip',
        }),
      }
    );

    await POST(req);

    const mkdirCalls = mkdirMock.mock.calls;

    let vulnerableCallFound = false;
    for (const call of mkdirCalls) {
      const dirPath = call[0] as string;
      if (dirPath.includes('malicious')) {
        vulnerableCallFound = true;
      }
    }

    expect(vulnerableCallFound).toBe(false);
  });
});
