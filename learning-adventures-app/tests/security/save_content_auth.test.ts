import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/internal/save-content/route';
import { NextRequest } from 'next/server';
import path from 'path';

const { writeFileMock, mkdirMock, mockGetServerSession } = vi.hoisted(() => {
  return {
    writeFileMock: vi.fn(),
    mkdirMock: vi.fn(),
    mockGetServerSession: vi.fn(),
  };
});

// Mock fs/promises
vi.mock('fs/promises', () => ({
  writeFile: writeFileMock,
  mkdir: mkdirMock,
  copyFile: vi.fn(),
  readdir: vi.fn(),
  default: {
    writeFile: writeFileMock,
    mkdir: mkdirMock,
  },
}));

vi.mock('fs', () => ({
  existsSync: vi.fn().mockReturnValue(false),
  default: {
    existsSync: vi.fn().mockReturnValue(false),
  },
}));

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: mockGetServerSession,
  default: {
    getServerSession: mockGetServerSession,
  },
}));

// Mock authOptions
vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

// Mock adm-zip
vi.mock('adm-zip', () => {
  return {
    default: class MockAdmZip {
      constructor() {}
      getEntries() {
        return [];
      }
    },
  };
});

describe('Security: Save Content Vulnerabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should BLOCK unauthorized access (missing auth check)', async () => {
    // Mock no session
    mockGetServerSession.mockResolvedValue(null);

    const req = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.html',
          type: 'game',
          content: '<h1>test</h1>',
        }),
      }
    );

    const response = await POST(req);

    // FIXED BEHAVIOR: Returns 403 Forbidden
    expect(response.status).toBe(403);
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it('should BLOCK non-admin access', async () => {
    // Mock user session
    mockGetServerSession.mockResolvedValue({
      user: {
        role: 'USER',
        id: '123',
      },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'test.html',
          type: 'game',
          content: '<h1>test</h1>',
        }),
      }
    );

    const response = await POST(req);

    // FIXED BEHAVIOR: Returns 403 Forbidden
    expect(response.status).toBe(403);
    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it('should BLOCK path traversal in fileName', async () => {
    // Mock ADMIN session
    mockGetServerSession.mockResolvedValue({
      user: {
        role: 'ADMIN',
        id: 'admin-123',
      },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: '../../../../tmp/pwned.html',
          type: 'game',
          content: '<h1>pwned</h1>',
        }),
      }
    );

    const response = await POST(req);

    // FIXED BEHAVIOR: Returns 400 Bad Request
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain('Invalid fileName');

    expect(writeFileMock).not.toHaveBeenCalled();
  });

  it('should ALLOW valid authorized request', async () => {
    // Mock ADMIN session
    mockGetServerSession.mockResolvedValue({
      user: {
        role: 'ADMIN',
        id: 'admin-123',
      },
    });

    const req = new NextRequest(
      'http://localhost:3000/api/internal/save-content',
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: 'valid-game.html',
          type: 'game',
          content: '<h1>valid</h1>',
        }),
      }
    );

    const response = await POST(req);

    expect(response.status).toBe(200);
    expect(writeFileMock).toHaveBeenCalled();

    const calledPath = writeFileMock.mock.calls[0][0];
    expect(calledPath).toContain('valid-game.html');
  });
});
