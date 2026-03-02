import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/signup/route';
import { prisma } from '@/lib/prisma';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

describe('Security: Signup Role Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sanitize ADMIN role to STUDENT on signup', async () => {
    const body = {
      name: 'Malicious User',
      email: 'hacker@example.com',
      password: 'password123',
      role: 'ADMIN',
    };

    const req = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '123',
      name: body.name,
      email: body.email,
      role: 'STUDENT',
      createdAt: new Date(),
    } as any);

    const response = await POST(req);

    // API sanitizes ADMIN → STUDENT and still returns 201
    expect(response.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'STUDENT',
        }),
      })
    );
  });

  it('should allow signup with valid role (STUDENT)', async () => {
    const body = {
      name: 'Valid Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'STUDENT',
    };

    const req = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.user.create).mockResolvedValue({
      id: '124',
      name: body.name,
      email: body.email,
      role: body.role,
      createdAt: new Date(),
    } as any);

    const response = await POST(req);

    expect(response.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalled();
    const createArgs = vi.mocked(prisma.user.create).mock.calls[0][0];
    expect(createArgs.data.role).toBe('STUDENT');
  });
});
