import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../app/api/auth/signup/route';
import { prisma } from '../../lib/prisma';
import { NextRequest } from 'next/server';

vi.mock('../../lib/prisma', () => ({
  prisma: { user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() } }
}));

const supabaseMock = vi.hoisted(() => ({ createUser: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: () => ({ auth: { admin: { createUser: supabaseMock.createUser } } })
}));
import { createdUser } from '../helpers/supabaseAdmin';

describe('Signup Security Controls - Subdomain Bypass', () => {
  beforeEach(() => {
    supabaseMock.createUser.mockResolvedValue(createdUser());
    vi.clearAllMocks();
  });

  it('PREVENTS creating a user with sub.learningadventures.org email (Privilege Escalation Bypass)', async () => {
    const req = new NextRequest('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Attacker',
        email: 'attacker@sub.learningadventures.org',
        password: 'password123',
        role: 'STUDENT',
        gradeLevel: '5'
      }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('learningadventures.org');
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
