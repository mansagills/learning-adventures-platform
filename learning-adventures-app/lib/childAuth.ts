import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const CHILD_SESSION_SECRET = new TextEncoder().encode(
  process.env.CHILD_SESSION_SECRET ||
    'child-session-secret-change-in-production'
);
const CHILD_SESSION_DURATION = 4 * 60 * 60; // 4 hours in seconds

export interface ChildSessionData {
  childId: string;
  parentId: string;
  username: string;
  gradeLevel: string;
}

/**
 * Hash a PIN for secure storage
 * PINs must be exactly 4 digits
 */
export async function hashPIN(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error('PIN must be exactly 4 digits');
  }
  return bcrypt.hash(pin, 10);
}

/**
 * Verify a PIN against stored hash
 */
export async function verifyPIN(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

/**
 * Create a child session JWT token
 * Also stores the session in the database for tracking
 */
export async function createChildSession(
  childProfile: ChildSessionData
): Promise<string> {
  const token = await new SignJWT({
    childId: childProfile.childId,
    parentId: childProfile.parentId,
    username: childProfile.username,
    gradeLevel: childProfile.gradeLevel,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${CHILD_SESSION_DURATION}s`)
    .sign(CHILD_SESSION_SECRET);

  // Store session in database
  const expiresAt = new Date(Date.now() + CHILD_SESSION_DURATION * 1000);
  await prisma.childSession.create({
    data: {
      childId: childProfile.childId,
      sessionToken: token,
      expires: expiresAt,
    },
  });

  return token;
}

/**
 * Verify and decode a child session JWT
 * Returns session data if valid, null if invalid or expired
 */
export async function verifyChildSession(
  token: string
): Promise<ChildSessionData | null> {
  try {
    const { payload } = await jwtVerify(token, CHILD_SESSION_SECRET);

    // Check if session exists in database and is not expired
    const session = await prisma.childSession.findUnique({
      where: { sessionToken: token },
      include: { child: true },
    });

    if (!session || session.expires < new Date()) {
      return null;
    }

    return {
      childId: payload.childId as string,
      parentId: payload.parentId as string,
      username: payload.username as string,
      gradeLevel: payload.gradeLevel as string,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Delete a child session (logout)
 * Silently fails if session doesn't exist
 */
export async function deleteChildSession(token: string): Promise<void> {
  await prisma.childSession
    .delete({
      where: { sessionToken: token },
    })
    .catch(() => {
      // Ignore if session doesn't exist
    });
}

/**
 * Clean up expired child sessions
 * Should be called periodically (e.g., via cron job)
 */
export async function cleanupExpiredChildSessions(): Promise<void> {
  await prisma.childSession.deleteMany({
    where: {
      expires: {
        lt: new Date(),
      },
    },
  });
}
