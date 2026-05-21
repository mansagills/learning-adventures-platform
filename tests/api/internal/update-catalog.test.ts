import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/internal/update-catalog/route';
import { readFile, writeFile } from 'fs/promises';

// Mock dependencies
vi.mock('fs/promises');
vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockResolvedValue({ apiUser: { role: 'ADMIN' }, error: null }),
}));

describe('update-catalog route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(readFile).mockResolvedValue(`
const mathGames: Adventure[] = [
];
`);
  });

  it('safely serializes metadata using JSON.stringify', async () => {
    const maliciousInput = {
      id: "foo",
      title: '", process.exit(1), "',
      description: "Test Description",
      type: "game",
      category: "math",
      gradeLevel: ["3", "4"],
      difficulty: "medium",
      skills: ["Addition"],
      estimatedTime: "10 mins",
      featured: false,
      subscriptionTier: "free"
    };

    const req = new NextRequest('http://localhost/api/internal/update-catalog', {
      method: 'POST',
      body: JSON.stringify({ metadata: maliciousInput }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);

    expect(writeFile).toHaveBeenCalled();
    const callArgs = vi.mocked(writeFile).mock.calls[0];
    const writtenContent = callArgs[1] as string;

    // Output should contain proper JSON formatting rather than raw execution
    expect(writtenContent).toContain('"title": "\\", process.exit(1), \\""');
  });
});
