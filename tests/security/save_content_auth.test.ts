import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  getApiUser: vi.fn()
}));

// Mock api-auth
vi.mock('@/lib/api-auth', () => ({
  getApiUser: mocks.getApiUser,
}));

// Mock dependencies
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  copyFile: vi.fn(),
  readdir: vi.fn(),
  rm: vi.fn(),
  default: {
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    copyFile: vi.fn(),
    readdir: vi.fn(),
    rm: vi.fn(),
  },
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  default: {
    existsSync: vi.fn().mockReturnValue(true),
  },
}));

// Mock AdmZip
vi.mock('adm-zip', () => {
  return {
    default: class MockAdmZip {
      constructor(path: string) {}
      extractAllTo = vi.fn();
      getEntries = vi.fn().mockReturnValue([]);
    },
  };
});

// Import the route handler AFTER mocking
import { POST } from '@/app/api/internal/save-content/route';

describe('Save Content Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should reject unauthorized requests with 401', async () => {
    mocks.getApiUser.mockResolvedValue({
      apiUser: null,
      error: new Response(null, { status: 401 }),
    });

    const request = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.html',
          type: 'game',
          subscriptionTier: 'free',
          content: 'test',
          uploadSource: 'generated',
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should reject requests from non-admin/non-teacher users with 401', async () => {
    mocks.getApiUser.mockResolvedValue({
      apiUser: {
        role: 'STUDENT',
      },
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.html',
          type: 'game',
          subscriptionTier: 'free',
          content: 'test',
          uploadSource: 'generated',
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should allow requests from ADMIN', async () => {
    mocks.getApiUser.mockResolvedValue({
      apiUser: {
        role: 'ADMIN',
      },
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.html',
          type: 'game',
          subscriptionTier: 'free',
          content: 'test',
          uploadSource: 'generated',
        }),
      }
    );

    const response = await POST(request);
    // Should be 200 or 400 depending on other validation, but NOT 401
    expect(response.status).not.toBe(401);
  });

  it('should allow requests from TEACHER', async () => {
    mocks.getApiUser.mockResolvedValue({
      apiUser: {
        role: 'TEACHER',
      },
      error: null,
    });

    const request = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.html',
          type: 'game',
          subscriptionTier: 'free',
          content: 'test',
          uploadSource: 'generated',
        }),
      }
    );

    const response = await POST(request);
    expect(response.status).not.toBe(401);
  });
});
