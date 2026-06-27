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

describe('Signup Security Controls', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMock.auth.admin.createUser.mockResolvedValue({ data: { user: { id: 'supabase-id' } }, error: null });
  });

  it('PREVENTS creating a user with @learningadventures.org email (Privilege Escalation Prevention)', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Hacker',
        email: 'hacker@learningadventures.org',
        password: 'password123',
        role: 'ADMIN',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(403);
    expect((await response.json()).error).toBe(
      'Signups with @learningadventures.org are restricted.'
    );
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('rejects invalid email formats', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        email: 'not-an-email',
        password: 'password123',
        role: 'STUDENT',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toBe('Invalid email format');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('rejects weak passwords (< 8 characters)', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        password: 'weak',
        role: 'STUDENT',
      }),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    expect((await response.json()).error).toContain('Password must be at least 8 characters');
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it('allows valid student signup', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Valid Student',
        email: 'student@example.com',
        password: 'strongpassword123',
        role: 'STUDENT',
      }),
    });

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'user-id',
      name: 'Valid Student',
      email: 'student@example.com',
      role: 'STUDENT',
    });

    const response = await POST(req);
    expect(response.status).toBe(201);
    expect(prismaMock.user.create).toHaveBeenCalled();
  });
});
