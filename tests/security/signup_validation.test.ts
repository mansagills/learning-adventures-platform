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

describe('Signup API Security Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should block signup with @learningadventures.org email (Privilege Escalation Prevention)', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Sneaky Admin',
        email: 'sneaky@learningadventures.org',
        password: 'password123',
        role: 'ADMIN',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(403);
    expect(data.error).toBe('Signups with @learningadventures.org are restricted.');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('should block signup with short password (Password Policy)', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Short Pass User',
        email: 'shortpass@example.com',
        password: '123', // Too short
        role: 'STUDENT',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toContain('Password must be at least 8 characters');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('should block signup with invalid email format', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Invalid Email User',
        email: 'not-an-email',
        password: 'password123',
        role: 'STUDENT',
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(400);
    expect(data.error).toBe('Invalid email format');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('should allow valid signup', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Valid User',
        email: 'valid@example.com',
        password: 'strongpassword123',
        role: 'STUDENT',
      }),
    });

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'valid-id',
      name: 'Valid User',
      email: 'valid@example.com',
      role: 'STUDENT',
      createdAt: new Date(),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(201);
    expect(prismaMock.user.create).toHaveBeenCalled();
  });
});
