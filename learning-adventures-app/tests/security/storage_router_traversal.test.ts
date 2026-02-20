import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { routeFileUpload } from '../../lib/storage/storageRouter';
import fs from 'fs/promises';
import path from 'path';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  default: {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock @vercel/blob
vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
  del: vi.fn(),
  list: vi.fn(),
}));

describe('Security: Path Traversal in storageRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw an error when attempting path traversal', async () => {
    // Mock a small file to trigger local storage path
    const file = {
      name: 'test.html',
      size: 100,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(10)),
      type: 'text/html'
    } as unknown as File;

    // Attempt path traversal: try to write to /etc/passwd (simulated)
    const traversalPath = 'games/../../../../etc/passwd';

    // We expect this to fail.
    await expect(routeFileUpload(file, traversalPath))
      .rejects
      .toThrow(/Path traversal detected/i);

    // Verify fs.writeFile was NOT called
    expect(fs.writeFile).not.toHaveBeenCalled();
  });

  it('should allow valid paths within public directory', async () => {
    const file = {
      name: 'valid.html',
      size: 100,
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(10)),
      type: 'text/html'
    } as unknown as File;

    const validPath = 'games/valid.html';

    await expect(routeFileUpload(file, validPath)).resolves.not.toThrow();

    // Verify it tried to write to the correct location
    expect(fs.writeFile).toHaveBeenCalled();
    const writeCall = vi.mocked(fs.writeFile).mock.calls[0];
    const writePath = writeCall[0] as string;

    // Check path ends with public/games/valid.html
    expect(writePath.endsWith(path.join('public', 'games', 'valid.html'))).toBe(true);
  });
});
