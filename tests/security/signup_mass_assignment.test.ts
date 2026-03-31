import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/signup/route';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    }
  }
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  }
}));

describe('Security: Signup Mass Assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('FIXED: should prevent creating ADMIN role via mass assignment', async () => {
    // Mock user not existing
    (prisma.user.findUnique as any).mockResolvedValue(null);

    // Mock user creation
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-123',
      email: 'attacker@example.com',
      role: 'STUDENT',
    });

    // Create request with ADMIN role
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Attacker',
        email: 'attacker@example.com',
        password: 'password123',
        role: 'ADMIN' // Trying to exploit mass assignment
      })
    });

    await POST(request);

    // Verify prisma.user.create was called with STUDENT role (sanitized)
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'STUDENT'
      })
    }));
  });

  it('should allow valid roles (STUDENT, PARENT, TEACHER)', async () => {
    // Mock user not existing
    (prisma.user.findUnique as any).mockResolvedValue(null);

    // Mock user creation
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-123',
      email: 'parent@example.com',
      role: 'PARENT',
    });

    // Create request with PARENT role
    const request = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Parent',
        email: 'parent@example.com',
        password: 'password123',
        role: 'PARENT'
      })
    });

    await POST(request);

    // Verify prisma.user.create was called with PARENT role
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'PARENT'
      })
    }));
  });
});
