import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Hoist the mock object
const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}));

// Import AFTER mocking
import { POST } from '@/app/api/auth/signup/route';

describe('Signup API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should prevent ADMIN role creation (mass assignment vulnerability fix)', async () => {
    // Setup request with malicious role
    const body = {
      name: 'Hacker',
      email: 'hacker@example.com',
      password: 'password123',
      role: 'ADMIN',
    };

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Mock prisma responses
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'user-id',
      ...body,
      role: 'STUDENT', // Expecting it to be sanitized to STUDENT
      createdAt: new Date(),
    });

    // Execute
    const response = await POST(req);
    await response.json();

    // Verify successful creation (but with sanitized role)
    expect(response.status).toBe(201);

    // Verify security fix: prisma.user.create was called with role: 'STUDENT'
    expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'STUDENT',
      }),
    }));
  });

  it('should allow PARENT role creation', async () => {
    // Setup request with valid role
    const body = {
      name: 'Parent User',
      email: 'parent@example.com',
      password: 'password123',
      role: 'PARENT',
    };

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    // Mock prisma responses
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'parent-id',
      ...body,
      createdAt: new Date(),
    });

    // Execute
    const response = await POST(req);
    await response.json();

    expect(response.status).toBe(201);

    // Verify: prisma.user.create was called with role: 'PARENT'
    expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'PARENT',
      }),
    }));
  });
});
