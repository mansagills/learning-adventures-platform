import { vi, describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/signup/route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
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

describe('Authentication Security - Role Validation', () => {
  it('should sanitize invalid roles (e.g. ADMIN) to STUDENT', async () => {
    // Setup mock request with ADMIN role
    const body = {
      name: 'Hacker',
      email: 'hacker@example.com',
      password: 'password123',
      role: 'ADMIN',
    };

    const req = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Mock Prisma responses
    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: '123',
      ...body,
      role: 'STUDENT', // Simulate successful creation with sanitized role
      createdAt: new Date(),
    });

    // Execute the handler
    await POST(req);

    // Verify if ADMIN role was sanitized to STUDENT
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'STUDENT',
        }),
      })
    );
  });
});
