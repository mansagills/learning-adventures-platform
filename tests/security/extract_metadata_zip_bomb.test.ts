import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/internal/extract-metadata/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockResolvedValue({
    apiUser: { id: 'admin-123', role: 'ADMIN' },
    error: null,
  }),
}));

const { mockAdmZip, mockGetEntries } = vi.hoisted(() => {
  const mockGetEntries = vi.fn();
  const mockAdmZip = vi.fn(() => ({
    getEntries: mockGetEntries,
  }));
  return { mockAdmZip, mockGetEntries };
});

vi.mock('adm-zip', () => ({
  default: mockAdmZip,
}));

describe('POST /api/internal/extract-metadata', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject metadata.json files larger than 1MB (Zip Bomb DoS protection)', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/internal/extract-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zipPath: '/test.zip',
      }),
    });

    const mockGetData = vi.fn();
    mockGetEntries.mockReturnValue([
      {
        entryName: 'metadata.json',
        isDirectory: false,
        header: {
          size: 1048576 + 1, // 1MB + 1 byte
        },
        getData: mockGetData,
      },
    ]);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Metadata file is too large (exceeds 1MB limit)');
    expect(mockGetData).not.toHaveBeenCalled(); // Verify getData() was never called
  });

  it('should allow metadata.json files under 1MB', async () => {
    const mockRequest = new NextRequest('http://localhost:3000/api/internal/extract-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zipPath: '/test.zip',
      }),
    });

    const mockGetData = vi.fn().mockReturnValue(Buffer.from(JSON.stringify({ title: 'Test Game' })));
    mockGetEntries.mockReturnValue([
      {
        entryName: 'metadata.json',
        isDirectory: false,
        header: {
          size: 1024, // 1KB
        },
        getData: mockGetData,
      },
    ]);

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.metadata.title).toBe('Test Game');
    expect(mockGetData).toHaveBeenCalled();
  });
});