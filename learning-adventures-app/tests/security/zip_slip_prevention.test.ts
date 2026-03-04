import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/internal/save-content/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { extractZipSafely } from '@/lib/safe-zip';

// Mock next-auth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

const { writeFileMock, mkdirMock, mockGetServerSession } = vi.hoisted(() => ({
  writeFileMock: vi.fn(),
  mkdirMock: vi.fn(),
  mockGetServerSession: vi.fn(),
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
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  }
}));

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
  default: {
    getServerSession: mockGetServerSession,
  },
}));

// Mock authOptions
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock AdmZip
const mockExtractAllTo = vi.fn();
const mockGetData = vi.fn().mockReturnValue(Buffer.from('content'));

// Define entries
const safeEntry = {
  entryName: 'safe.html',
  isDirectory: false,
  getData: mockGetData,
};

const maliciousEntry = {
  entryName: '../../etc/passwd',
  isDirectory: false,
  getData: mockGetData,
};

const mockGetEntries = vi.fn().mockReturnValue([safeEntry, maliciousEntry]);

vi.mock('adm-zip', () => {
  return {
    ...actual,
    existsSync: vi.fn(),
  };
});

describe('Security: Zip Slip Prevention', () => {
  const mockTargetDir = '/tmp/safe-dir';

  beforeEach(() => {
    vi.clearAllMocks();
    (fs.mkdir as any).mockResolvedValue(undefined);
    (fs.writeFile as any).mockResolvedValue(undefined);
    (existsSync as any).mockReturnValue(true); // default to exists
  });

  it('should prevent Zip Slip by validating paths', async () => {
    // Mock admin session
    (getServerSession as any).mockResolvedValue({
      user: { role: 'ADMIN', id: 'admin' },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test-game.html',
          type: 'game',
          subscriptionTier: 'free',
          uploadSource: 'uploaded',
          uploadedZipPath: '/uploads/temp/test.zip',
        }),
      }
    );
  });

  it('should prevent Zip Slip with "../"', async () => {
    const mockZip = {
      getEntries: () => [
        {
          isDirectory: false,
          entryName: '../../etc/passwd',
          getData: () => Buffer.from('malicious content')
        }
      ]
    };

    await expect(extractZipSafely(mockZip as any, mockTargetDir))
      .rejects
      .toThrow('Security Error: Malicious zip entry detected');

    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should prevent Zip Slip with absolute paths if supported/attempted', async () => {
    // On unix, absolute path starts with /
    const mockZip = {
      getEntries: () => [
        {
          isDirectory: false,
          entryName: '/etc/passwd',
          getData: () => Buffer.from('malicious content')
        }
      ]
    };

    // Note: path.resolve('/tmp/safe-dir', '/etc/passwd') -> '/etc/passwd'
    // So this should fail the containment check

    await expect(extractZipSafely(mockZip as any, mockTargetDir))
      .rejects
      .toThrow('Security Error: Malicious zip entry detected');

    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should allow nested directories within target', async () => {
     const mockZip = {
      getEntries: () => [
        {
          isDirectory: false,
          entryName: 'level1/level2/file.txt',
          getData: () => Buffer.from('content')
        }
      ]
    };

    await extractZipSafely(mockZip as any, mockTargetDir);

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.resolve(mockTargetDir, 'level1/level2/file.txt'),
      expect.anything()
    );
  });
});
