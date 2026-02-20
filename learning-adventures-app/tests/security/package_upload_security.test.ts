import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processGamePackage } from '@/lib/upload/gamePackageHandler';
import fs from 'fs/promises';
import { prisma } from '@/lib/prisma';
import path from 'path';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
  }
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    testGame: {
      findUnique: vi.fn(),
      create: vi.fn(),
    }
  }
}));

// Mock extractMetadata
vi.mock('@/lib/upload/metadataExtractor', () => ({
  extractMetadata: vi.fn().mockResolvedValue({})
}));

// Mock adm-zip
vi.mock('adm-zip', () => {
  return {
    default: class MockAdmZip {
      constructor(buffer: any) {}
      getEntry(name: string) {
        if (name === 'metadata.json') {
          return {
            getData: () => Buffer.from(JSON.stringify({
              id: '../../../../tmp/hacked',
              title: 'Hacked Game',
              description: 'This is a test',
              gameFile: 'index.html'
            }))
          };
        }
        if (name === 'index.html') {
          return {
            getData: () => Buffer.from('<h1>You have been hacked</h1>')
          };
        }
        return null;
      }
    }
  }
});

describe('Security: Package Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sanitize game ID preventing path traversal', async () => {
    // Create a mock File object
    const file = {
        arrayBuffer: async () => Buffer.from('fake zip content'),
        name: 'game.zip'
    } as unknown as File;

    // Mock prisma responses
    (prisma.testGame.findUnique as any).mockResolvedValue(null);
    (prisma.testGame.create as any).mockResolvedValue({
      id: 'test-id',
      gameId: 'tmphacked' // Expect sanitized ID
    });

    try {
      await processGamePackage(file, 'user-123');
    } catch (e) {
      console.error('Error during processing:', e);
    }

    // Check what path fs.writeFile was called with
    const writeFileMock = fs.writeFile as any;

    expect(writeFileMock).toHaveBeenCalled();

    const calledPath = writeFileMock.mock.calls[0][0];

    // Verify if path is contained within staging directory
    const cwd = process.cwd();
    const expectedPrefix = path.join(cwd, 'public', 'staging', 'games');

    const isContained = calledPath.startsWith(expectedPrefix);
    expect(isContained).toBe(true);

    // Verify the filename is sanitized
    expect(calledPath).toContain('tmphacked.html');
    expect(calledPath).not.toContain('..');
  });
});
