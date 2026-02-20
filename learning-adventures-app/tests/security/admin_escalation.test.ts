
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/auth/signup/route';
import { prisma } from '../../lib/prisma';
import { NextRequest } from 'next/server';

// Mock Prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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

describe('Signup Security Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PREVENTS creating a user with @learningadventures.org email (Privilege Escalation Prevention)', async () => {
    const body = {
      name: 'Attacker',
      email: 'attacker@learningadventures.org',
      password: 'password123',
      role: 'STUDENT',
      gradeLevel: '5'
    };

    const req = {
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Registration with this domain is restricted');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects invalid email formats', async () => {
    const body = {
      name: 'User',
      email: 'invalid-email',
      password: 'password123',
      role: 'STUDENT'
    };

    const req = {
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('Invalid email format');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects weak passwords (< 8 characters)', async () => {
    const body = {
      name: 'User',
      email: 'user@example.com',
      password: 'short',
      role: 'STUDENT'
    };

    const req = {
      json: async () => body,
    } as unknown as NextRequest;

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('Password must be at least 8 characters long');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('allows valid student signup', async () => {
    const body = {
      name: 'Student',
      email: 'student@example.com',
      password: 'password123',
      role: 'STUDENT',
      gradeLevel: '5'
    };

    const req = {
      json: async () => body,
    } as unknown as NextRequest;

    (prisma.user.findUnique as any).mockResolvedValue(null);
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-123',
      ...body,
      role: 'STUDENT',
      createdAt: new Date(),
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
