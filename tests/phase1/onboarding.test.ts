import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Onboarding API route ────────────────────────────────────────────────────

// We test the route handler logic by mocking its dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn().mockResolvedValue({ id: 'user-1', hasCompletedOnboarding: true }),
    },
  },
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('POST /api/onboarding/complete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when user is not authenticated', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const { POST } = await import('@/app/api/onboarding/complete/route');
    const res = await POST();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('Unauthorized');
  });

  it('marks onboarding complete for authenticated user', async () => {
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: 'user-1', name: 'Test Student', email: 'student@test.com' },
      expires: '9999',
    });

    const { prisma } = await import('@/lib/prisma');
    const { POST } = await import('@/app/api/onboarding/complete/route');
    const res = await POST();

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { hasCompletedOnboarding: true },
    });
  });
});
