import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  readFile: vi.fn().mockResolvedValue('const mathGames: Adventure[] = [];'),
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

// Mock dependencies
vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockResolvedValue({
    apiUser: { role: 'ADMIN', id: 'admin123' },
    error: null,
  }),
}));

vi.mock('fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs/promises')>();
  return {
    ...actual,
    readFile: mocks.readFile,
    writeFile: mocks.writeFile,
    default: {
      readFile: mocks.readFile,
      writeFile: mocks.writeFile,
    }
  };
});

// Import after mocks
import { POST } from '@/app/api/internal/update-catalog/route';

describe('Update Catalog API - SSTI Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should safely escape malicious payload preventing SSTI/RCE', async () => {
    const maliciousPayload = {
      metadata: {
        id: 'test-id',
        title: 'SafeTitle',
        description: 'Safe Description',
        type: 'game',
        category: 'math',
        gradeLevel: ['1'],
        difficulty: 'easy',
        skills: ['Math'],
        estimatedTime: '10 mins',
        // Malicious payload that attempts to break out of string interpolation
        htmlPath: "', maliciousCode: process.env.SECRET, description: '",
      }
    };

    const request = new NextRequest('http://localhost:3000/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify(maliciousPayload),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);

    // Verify that the payload is safely serialized
    expect(mocks.writeFile).toHaveBeenCalled();
    const writeCall = mocks.writeFile.mock.calls[0];
    const writtenContent = writeCall[1];

    // The string should contain properly serialized representation, neutralizing quotes
    expect(writtenContent).toContain('"htmlPath": "\', maliciousCode: process.env.SECRET, description: \'"');
  });
});
