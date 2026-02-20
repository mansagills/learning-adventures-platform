import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/signup/route';
import { NextRequest } from 'next/server';

// Mock prisma using vi.hoisted to handle hoisting
const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    },
  };
});

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}));

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
  },
}));

describe('Signup API Vulnerability Check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('prevents creating an ADMIN user via mass assignment (VULNERABILITY FIX VERIFICATION)', async () => {
    // Setup: User does not exist
    prismaMock.user.findUnique.mockResolvedValue(null);

    // Setup: Create returns the user
    prismaMock.user.create.mockImplementation((args: any) => Promise.resolve(args.data));

    const body = {
      name: 'Attacker',
      email: 'attacker@example.com',
      password: 'password123',
      role: 'ADMIN', // The exploit attempt
    };

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    await POST(req);

    // Verify that prisma.user.create was called with role: 'STUDENT' (sanitized)
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'STUDENT',
        }),
      })
    );
  });

  it('allows creating a TEACHER user (valid role)', async () => {
    // Setup: User does not exist
    prismaMock.user.findUnique.mockResolvedValue(null);

    // Setup: Create returns the user
    prismaMock.user.create.mockImplementation((args: any) => Promise.resolve(args.data));

    const body = {
      name: 'Teacher',
      email: 'teacher@example.com',
      password: 'password123',
      role: 'TEACHER',
    };

    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    await POST(req);

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
