import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/auth/signup/route';
import { NextRequest } from 'next/server';
import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

// Mock Prisma
vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock('bcryptjs', () => {
  const hash = vi.fn();
  const compare = vi.fn();
  return {
    default: {
      hash,
      compare,
    },
    hash,
    compare,
  };
});

describe('Signup API Security Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block signup with @learningadventures.org email (Privilege Escalation Prevention)', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Attacker',
        email: 'attacker@learningadventures.org',
        password: 'password123',
        role: 'STUDENT',
      }),
    });

    // Mock that user does not exist
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toContain('learningadventures.org');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should block signup with short password (Password Policy)', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'User',
        email: 'user@example.com',
        password: '123', // Too short
        role: 'STUDENT',
      }),
    });

    (prisma.user.findUnique as any).mockResolvedValue(null);

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('at least 8 characters');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should block signup with invalid email format', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'User',
        email: 'invalid-email', // No @ or .
        password: 'password123',
        role: 'STUDENT',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Invalid email format');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('should allow valid signup', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Valid User',
        email: 'valid@example.com',
        password: 'securepassword123',
        role: 'STUDENT',
      }),
    });

    (prisma.user.findUnique as any).mockResolvedValue(null);
    (bcrypt.hash as any).mockResolvedValue('hashed_password');
    (prisma.user.create as any).mockResolvedValue({
      id: 'user-id',
      email: 'valid@example.com',
      role: 'STUDENT',
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
