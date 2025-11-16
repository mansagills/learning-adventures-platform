/**
 * Certificate Utility Functions
 *
 * Helper functions for certificate generation
 */

import { prisma } from '@/lib/prisma';

/**
 * Generate a unique certificate number
 * Format: CERT-YYYY-NNNNNN (e.g., CERT-2025-000123)
 */
export async function generateCertificateNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get the count of certificates issued this year
  const startOfYear = new Date(year, 0, 1);
  const count = await prisma.courseCertificate.count({
    where: {
      issuedAt: {
        gte: startOfYear,
      },
    },
  });

  // Increment and pad with zeros
  const sequenceNumber = (count + 1).toString().padStart(6, '0');

  return `CERT-${year}-${sequenceNumber}`;
}

/**
 * Generate a unique verification code
 * Format: 12-character alphanumeric code (e.g., A1B2C3D4E5F6)
 */
export async function generateVerificationCode(): Promise<string> {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code: string;
  let isUnique = false;

  // Keep generating until we get a unique code
  while (!isUnique) {
    code = '';
    for (let i = 0; i < 12; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Check if code already exists
    const existing = await prisma.courseCertificate.findUnique({
      where: { verificationCode: code },
    });

    if (!existing) {
      isUnique = true;
      return code;
    }
  }

  throw new Error('Failed to generate unique verification code');
}

/**
 * Format date for certificate display
 */
export function formatCertificateDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * Format time spent in hours and minutes
 */
export function formatTimeSpent(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) {
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
  }

  if (mins === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
}

/**
 * Calculate achievement level based on score
 */
export function getAchievementLevel(averageScore: number | null): string {
  if (!averageScore) {
    return 'Completion';
  }

  if (averageScore >= 95) {
    return 'Outstanding Achievement';
  } else if (averageScore >= 85) {
    return 'High Achievement';
  } else if (averageScore >= 75) {
    return 'Achievement';
  } else {
    return 'Completion';
  }
}
