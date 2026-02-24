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

  it('should sanitize invalid roles (e.g. ADMIN) to STUDENT', async () => {
    // Setup request with ADMIN role
    const body = {
      name: 'Malicious User',
      email: 'hacker@example.com',
      password: 'password123',
      role: 'ADMIN',
    };

    const req = {
      json: async () => body,
    } as unknown as NextRequest;

    // Mock findUnique to return null (user doesn't exist)
    (prisma.user.findUnique as any).mockResolvedValue(null);

    // Mock create to return the user with sanitized role
    (prisma.user.create as any).mockImplementation(async (args: any) => ({
      id: '123',
      ...args.data,
      role: args.data.role, // Use the role passed to create
      createdAt: new Date(),
    }));

    // Execute the handler
    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);

    // Verify prisma.user.create was called with sanitized role
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'STUDENT',
      }),
    }));

    expect(data.user.role).toBe('STUDENT');
  });

  it('should allow signup with valid role (TEACHER)', async () => {
    // Setup request with valid role
    const body = {
      name: 'Teacher',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'TEACHER',
    };

    const req = {
      json: async () => body,
    } as unknown as NextRequest;

    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockImplementation(async (args: any) => ({
      id: '124',
      ...args.data,
      role: args.data.role,
      createdAt: new Date(),
    }));

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'TEACHER',
      }),
    }));
    expect(data.user.role).toBe('TEACHER');
  });
});
