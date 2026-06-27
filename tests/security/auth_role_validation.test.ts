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

describe('Authentication Security - Role Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sanitize invalid roles (e.g. ADMIN) to STUDENT', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Sneaky User',
        email: 'sneaky@example.com',
        password: 'strongpassword123',
        role: 'ADMIN', // Malicious input trying to escalate privileges
      }),
    });

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: 'sneaky-id',
      name: 'Sneaky User',
      email: 'sneaky@example.com',
      role: 'STUDENT',
    });

    const response = await POST(req);
    expect(response.status).toBe(201);

    // Verify if ADMIN role was sanitized to STUDENT
    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'STUDENT', // Assert it was coerced safely
        }),
      })
    );
  });
});
