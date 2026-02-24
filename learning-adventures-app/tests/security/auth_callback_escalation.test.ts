import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authOptions } from '../../lib/auth';
import { prisma } from '../../lib/prisma';

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
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

// Mock NextAuth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

describe('Auth Callback Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('PREVENTS upgrading credentials user to ADMIN if email domain matches', async () => {
    const signInCallback = authOptions.callbacks?.signIn;
    if (!signInCallback) throw new Error('No signIn callback defined');

    const mockUser = {
      email: 'attacker@learningadventures.org',
      name: 'Attacker',
    };

    const mockAccount = {
      provider: 'credentials',
      type: 'credentials',
      providerAccountId: 'credentials',
    };

    // Simulate user exists but is currently a STUDENT
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-123',
      email: 'attacker@learningadventures.org',
      role: 'STUDENT',
    });

    const result = await signInCallback({ user: mockUser as any, account: mockAccount as any, profile: undefined as any, email: undefined as any, credentials: undefined as any });

    // Should return true (allow login) but NOT upgrade
    expect(result).toBe(true);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('PREVENTS creating ADMIN user for OAuth if email domain matches (Blocks Signup)', async () => {
    const signInCallback = authOptions.callbacks?.signIn;
    if (!signInCallback) throw new Error('No signIn callback defined');

    const mockUser = {
      email: 'attacker@learningadventures.org',
      name: 'Attacker',
    };

    const mockAccount = {
      provider: 'google',
      type: 'oauth',
      providerAccountId: 'google-123',
    };

    // Simulate user does not exist
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const result = await signInCallback({ user: mockUser as any, account: mockAccount as any, profile: undefined as any, email: undefined as any, credentials: undefined as any });

    // Should return false (BLOCK signup)
    expect(result).toBe(false);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('ALLOWS creating STUDENT user for OAuth if email domain is normal', async () => {
    const signInCallback = authOptions.callbacks?.signIn;
    if (!signInCallback) throw new Error('No signIn callback defined');

    const mockUser = {
      email: 'student@example.com',
      name: 'Student',
    };

    const mockAccount = {
      provider: 'google',
      type: 'oauth',
      providerAccountId: 'google-123',
    };

    // Simulate user does not exist
    (prisma.user.findUnique as any).mockResolvedValue(null);

    const result = await signInCallback({ user: mockUser as any, account: mockAccount as any, profile: undefined as any, email: undefined as any, credentials: undefined as any });

    // Should return true (allow signup) and create STUDENT
    expect(result).toBe(true);
    expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        role: 'STUDENT',
      }),
    }));
  });
});
