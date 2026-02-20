import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies BEFORE import
vi.mock('fs/promises', () => ({
  default: {
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    copyFile: vi.fn(),
    readdir: vi.fn(),
  },
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  copyFile: vi.fn(),
  readdir: vi.fn(),
}));

vi.mock('fs', () => ({
  existsSync: vi.fn(() => true),
  default: {
    existsSync: vi.fn(() => true),
  },
}));

// Mock AdmZip
const mockExtractAllTo = vi.fn();
const mockGetEntries = vi.fn().mockReturnValue([]);

vi.mock('adm-zip', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      extractAllTo: mockExtractAllTo,
      getEntries: mockGetEntries,
    })),
  };
});

// Import the route AFTER mocks
import { POST } from '@/app/api/internal/save-content/route';

describe('Security: Zip Slip & Path Traversal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should BLOCK Path Traversal in uploadedZipPath', async () => {
    const req = new NextRequest('http://localhost/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        content: null,
        fileName: 'test-game',
        type: 'game',
        subscriptionTier: 'free',
        uploadedZipPath: '../../../../etc/passwd', // Malicious path
        uploadSource: 'uploaded',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toMatch(/Invalid path/i);
  });

  it('should BLOCK Zip Slip in zip contents', async () => {
    // Setup mock entries for Zip Slip
    mockGetEntries.mockReturnValue([
      {
        entryName: '../../evil.js',
        isDirectory: false,
        getData: () => Buffer.from('evil code'),
        header: { size: 100 },
      },
    ]);

    const req = new NextRequest('http://localhost/api/internal/save-content', {
      method: 'POST',
      body: JSON.stringify({
        content: null,
        fileName: 'test-game',
        type: 'game',
        subscriptionTier: 'free',
        uploadedZipPath: 'uploads/temp/valid.zip',
        uploadSource: 'uploaded',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    // Should catch the error and return 500
    expect(res.status).toBe(500);
    expect(data.details).toMatch(/Zip Slip detected/i);

    // Ensure the vulnerable method is NOT called
    expect(mockExtractAllTo).not.toHaveBeenCalled();
  });
});
