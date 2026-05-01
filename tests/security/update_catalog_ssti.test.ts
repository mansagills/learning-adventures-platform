import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockReadFile = vi.hoisted(() => vi.fn());
const mockWriteFile = vi.hoisted(() => vi.fn());

vi.mock('fs/promises', () => ({
  default: {
    readFile: mockReadFile,
    writeFile: mockWriteFile,
  },
  readFile: mockReadFile,
  writeFile: mockWriteFile,
}));

vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockResolvedValue({
    apiUser: { role: 'ADMIN', id: 'admin123' },
    error: null,
  }),
}));

import { POST } from '../../app/api/internal/update-catalog/route';

describe('Update Catalog SSTI Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('safely serializes malicious payload', async () => {
    // Mock the catalog file content
    const mockCatalog = `
export const mathGames: Adventure[] = [
  { id: '1' }
];`;
    mockReadFile.mockResolvedValue(mockCatalog);

    const maliciousPayload = {
      metadata: {
        id: 'test',
        title:
          "Malicious', inject: () => console.log('hacked'), description: '",
        description: 'Test',
        type: 'game',
        category: 'math',
        gradeLevel: ['1'],
        difficulty: 'easy',
        skills: ['math'],
        estimatedTime: '10 mins',
      },
    };

    const request = new NextRequest(
      'http://localhost:3000/api/internal/update-catalog',
      {
        method: 'POST',
        body: JSON.stringify(maliciousPayload),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(200);

    // Verify writeFile was called with safely serialized content
    const writeFileCall = mockWriteFile.mock.calls[0];
    const writtenContent = writeFileCall[1] as string;

    // The written string should contain the JSON.stringified title with properly escaped quotes
    expect(writtenContent).toContain(
      `"Malicious', inject: () => console.log('hacked'), description: '"`
    );
    // It should not contain unescaped raw code injection
    expect(writtenContent).not.toContain(
      `title: 'Malicious', inject: () => console.log('hacked'), description: ''`
    );
  });
});
