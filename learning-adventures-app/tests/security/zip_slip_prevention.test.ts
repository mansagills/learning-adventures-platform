import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractZipSafely } from '@/lib/safe-zip';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  }
}));

// Mock fs
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
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

  it('should extract safe files correctly', async () => {
    const mockZip = {
      getEntries: () => [
        {
          isDirectory: false,
          entryName: 'safe-file.txt',
          getData: () => Buffer.from('safe content')
        },
        {
          isDirectory: true,
          entryName: 'safe-dir/',
        }
      ]
    };

    await extractZipSafely(mockZip as any, mockTargetDir);

    expect(fs.writeFile).toHaveBeenCalledWith(
      path.resolve(mockTargetDir, 'safe-file.txt'),
      expect.anything()
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
