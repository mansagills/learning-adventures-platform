import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/internal/save-content/route';
import { NextRequest } from 'next/server';

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
    default: class MockAdmZip {
      constructor(path: string) {}
      extractAllTo = mockExtractAllTo;
      getEntries = mockGetEntries;
    },
  };
});

// Spy on console.warn
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

describe('Security: Zip Slip Vulnerability in save-content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent Zip Slip by validating paths', async () => {
    const req = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test-game.html',
          type: 'game',
          subscriptionTier: 'free',
          uploadSource: 'uploaded',
          uploadedZipPath: '/uploads/test.zip',
        }),
      }
    );

    await POST(req);

    // Should NOT use extractAllTo anymore
    expect(mockExtractAllTo).not.toHaveBeenCalled();

    // Should iterate entries
    expect(mockGetEntries).toHaveBeenCalled();

    // Should have called writeFile for safe entry
    const safeCalls = writeFileMock.mock.calls.filter((call: any[]) =>
      call[0].endsWith('safe.html')
    );
    expect(safeCalls.length).toBe(1);

    // Should NOT have called writeFile for malicious entry
    const maliciousCalls = writeFileMock.mock.calls.filter((call: any[]) =>
      call[0].endsWith('passwd')
    );
    expect(maliciousCalls.length).toBe(0);

    // Should verify that a warning was logged
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Skipped file trying to escape target directory')
    );
  });
});
