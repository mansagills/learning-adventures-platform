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

describe('Signup API Vulnerability Check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents creating an ADMIN user via mass assignment (VULNERABILITY FIX VERIFICATION)', async () => {
    // Attack payload attempting to escalate privileges to ADMIN
    const payload = {
      name: 'Malicious Actor',
      email: 'hacker@example.com',
      password: 'password123',
      role: 'ADMIN',
    };

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'hacker-id',
      name: 'Malicious Actor',
      email: 'hacker@example.com',
      role: 'STUDENT',
      createdAt: new Date(),
    });

    const res = await POST(req);
    await res.json();

    expect(res.status).toBe(201);

    // Verify that prisma.user.create was called with role: 'STUDENT' despite the payload specifying 'ADMIN'
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'STUDENT',
        }),
      })
    );
  });

  it('allows creating a TEACHER user (valid role)', async () => {
    const payload = {
      name: 'Mr. Teacher',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'TEACHER',
    };

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'teacher-id',
      name: 'Mr. Teacher',
      email: 'teacher@example.com',
      role: 'TEACHER',
      createdAt: new Date(),
    });

    const res = await POST(req);
    await res.json();

    expect(res.status).toBe(201);

    // Verify that prisma.user.create was called with role: 'TEACHER'
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'TEACHER',
        }),
      })
    );
  });
});
