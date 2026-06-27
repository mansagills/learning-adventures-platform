import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { prismaMock, supabaseMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
  supabaseMock: {
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'supabase-id' } }, error: null })
      }
    }
  }
}));

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn().mockReturnValue(supabaseMock)
}));

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}));

import { POST } from '@/app/api/auth/signup/route';

describe('Security: Signup Mass Assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('FIXED: should prevent creating ADMIN role via mass assignment', async () => {
    const maliciousPayload = {
      name: 'Hacker',
      email: 'hacker123@example.com',
      password: 'password123',
      role: 'ADMIN', // The attack payload
    };

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(maliciousPayload),
    });

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'hacker-id',
      name: 'Hacker',
      email: 'hacker123@example.com',
      role: 'STUDENT',
      createdAt: new Date(),
    });

    const response = await POST(req);
    await response.json();

    expect(response.status).toBe(201);

    // Verify prisma.user.create was called with STUDENT role (sanitized)
    expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'STUDENT'
      })
    }));
  });

  it('should allow valid roles (STUDENT, PARENT, TEACHER)', async () => {
    const validPayload = {
      name: 'Parent User',
      email: 'parent1@example.com',
      password: 'password123',
      role: 'PARENT', // Valid role
    };

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(validPayload),
    });

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'parent-id',
      name: 'Parent User',
      email: 'parent1@example.com',
      role: 'PARENT',
      createdAt: new Date(),
    });

    const response = await POST(req);
    await response.json();

    expect(response.status).toBe(201);

    // Verify prisma.user.create was called with PARENT role
    expect(prismaMock.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'PARENT'
      })
    }));
  });
});
