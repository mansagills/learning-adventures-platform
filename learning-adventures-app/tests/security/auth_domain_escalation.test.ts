
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
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

// Mock NextAuth
vi.mock('next-auth/next', () => ({
  getServerSession: vi.fn(),
}));

describe('Auth Domain Escalation Prevention', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should NOT automatically assign ADMIN role to @learningadventures.org emails via OAuth', async () => {
    const signInCallback = authOptions.callbacks?.signIn;
    if (!signInCallback) throw new Error('signIn callback not defined');

    const user = {
      email: 'attacker@learningadventures.org',
      name: 'Attacker',
      image: 'http://example.com/image.jpg',
    };

    const account = {
      provider: 'google',
      type: 'oauth',
      providerAccountId: '12345',
    };

    // Mock that user does not exist
    (prisma.user.findUnique as any).mockResolvedValue(null);

    // Call signIn
    await signInCallback({ user, account, profile: {} } as any);

    // Verify user creation
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        email: user.email,
        name: user.name,
        image: user.image,
        role: 'STUDENT', // Should be STUDENT, not ADMIN
      },
    });
  });

  it('should NOT upgrade existing users to ADMIN based on email domain', async () => {
    const signInCallback = authOptions.callbacks?.signIn;
    if (!signInCallback) throw new Error('signIn callback not defined');

    const user = {
      email: 'existing@learningadventures.org',
      name: 'Existing User',
    };

    const account = {
      provider: 'google',
      type: 'oauth',
      providerAccountId: '12345',
    };

    // Mock that user exists but is not ADMIN
    (prisma.user.findUnique as any).mockResolvedValue({
      id: 'user-123',
      email: user.email,
      role: 'STUDENT',
    });

    // Call signIn
    await signInCallback({ user, account, profile: {} } as any);

    // Verify NO upgrade happens
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
