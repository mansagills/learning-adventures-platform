import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock fs/promises to avoid actual file system operations
vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  copyFile: vi.fn(),
  readdir: vi.fn(),
  default: {
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    copyFile: vi.fn(),
    readdir: vi.fn(),
  },
}));

// Mock fs
vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(true),
  default: {
    existsSync: vi.fn().mockReturnValue(true),
  },
}));

// Mock AdmZip
vi.mock('adm-zip', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      extractAllTo: vi.fn(),
      getEntries: vi.fn().mockReturnValue([]),
    })),
  };
});

// Mock next-auth
const getServerSessionMock = vi.fn();
vi.mock('next-auth/next', () => ({
  getServerSession: (...args: any[]) => getServerSessionMock(...args),
}));

// Mock auth options
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Import the route handler
import { POST } from '@/app/api/internal/save-content/route';

describe('Save Content API Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 401/403 if user is not authenticated', async () => {
    // Mock no session
    getServerSessionMock.mockResolvedValue(null);

    const request = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.html',
          type: 'game',
          subscriptionTier: 'free',
          content: '<html>test</html>',
          uploadSource: 'generated',
        }),
      }
    );

    const response = await POST(request);

    // Expect 401 Unauthorized or 403 Forbidden
    // Currently it returns 200 because auth check is missing
    expect(response.status).toBeOneOf([401, 403]);
  });

  it('should return 403 if user is authenticated but not ADMIN/TEACHER', async () => {
    // Mock student session
    getServerSessionMock.mockResolvedValue({
      user: {
        name: 'Student',
        email: 'student@example.com',
        role: 'STUDENT',
      },
    });

    const request = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.html',
          type: 'game',
          subscriptionTier: 'free',
          content: '<html>test</html>',
          uploadSource: 'generated',
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(403);
  });

  it('should allow ADMIN user', async () => {
    // Mock admin session
    getServerSessionMock.mockResolvedValue({
      user: {
        name: 'Admin',
        email: 'admin@example.com',
        role: 'ADMIN',
      },
    });

    const request = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.html',
          type: 'game',
          subscriptionTier: 'free',
          content: '<html>test</html>',
          uploadSource: 'generated',
        }),
      }
    );

    const response = await POST(request);

    expect(response.status).toBe(200);
  });
});
