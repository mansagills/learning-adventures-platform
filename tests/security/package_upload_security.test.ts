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
  },
}));

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    testGame: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock extractMetadata
vi.mock('@/lib/upload/metadataExtractor', () => ({
  extractMetadata: vi.fn().mockResolvedValue({}),
}));

// Mock adm-zip.
//
// Entries carry a `header.size` and the archive answers getEntries(), because
// the handler now reads both: lib/zip-limits.ts checks an entry's declared
// uncompressed size before decompressing it, and the archive's entry count and
// total declared size before touching any entry. A mock without them stands in
// for a ZipEntry that could not exist, and the handler rejects it before this
// suite's path-traversal assertion is ever reached.
//
// The sizes below are the real byte lengths of the payloads, so this fixture
// stays honest: it exercises the traversal path, not the size limits, which
// zip-bomb.test.ts covers against real archives.
const MANIFEST_BYTES = Buffer.from(
  JSON.stringify({
    id: '../../../../tmp/hacked',
    title: 'Hacked Game',
    description: 'This is a test',
    gameFile: 'index.html',
  })
);
const GAME_BYTES = Buffer.from('<h1>You have been hacked</h1>');

vi.mock('adm-zip', () => {
  const entry = (data: Buffer, entryName: string) => ({
    entryName,
    isDirectory: false,
    header: { size: data.length },
    getData: () => data,
  });

  return {
    default: class MockAdmZip {
      constructor(_buffer: any) {}
      getEntries() {
        return [
          entry(MANIFEST_BYTES, 'metadata.json'),
          entry(GAME_BYTES, 'index.html'),
        ];
      }
      getEntry(name: string) {
        if (name === 'metadata.json') return entry(MANIFEST_BYTES, 'metadata.json');
        if (name === 'index.html') return entry(GAME_BYTES, 'index.html');
        return null;
      }
    },
  };
});

describe('Security: Package Upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sanitize game ID preventing path traversal', async () => {
    // Create a mock File object
    const file = {
      arrayBuffer: async () => Buffer.from('fake zip content'),
      name: 'game.zip',
    } as unknown as File;

    // Mock prisma responses
    (prisma.testGame.findUnique as any).mockResolvedValue(null);
    (prisma.testGame.create as any).mockResolvedValue({
      id: 'test-id',
      gameId: 'tmphacked', // Expect sanitized ID
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
