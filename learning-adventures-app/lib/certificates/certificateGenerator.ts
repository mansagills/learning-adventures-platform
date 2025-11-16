/**
 * Certificate Generator Utility
 *
 * Handles certificate generation logic for completed courses
 */

import { prisma } from '@/lib/prisma';
import { generateCertificateNumber, generateVerificationCode } from './certificateUtils';

export interface CertificateData {
  id: string;
  certificateNumber: string;
  verificationCode: string;
  studentName: string;
  courseTitle: string;
  completionDate: Date;
  totalXPEarned: number;
  averageScore: number | null;
  totalLessons: number;
  timeSpent: number;
  issuedAt: Date;
}

/**
 * Generate a certificate for a completed course enrollment
 */
export async function generateCertificate(
  enrollmentId: string
): Promise<CertificateData> {
  // Check if certificate already exists
  const existingCertificate = await prisma.courseCertificate.findUnique({
    where: { enrollmentId },
    include: {
      enrollment: {
        include: {
          user: true,
          course: true,
        },
      },
    },
  });

  if (existingCertificate) {
    return {
      id: existingCertificate.id,
      certificateNumber: existingCertificate.certificateNumber,
      verificationCode: existingCertificate.verificationCode,
      studentName: existingCertificate.studentName,
      courseTitle: existingCertificate.courseTitle,
      completionDate: existingCertificate.completionDate,
      totalXPEarned: existingCertificate.totalXPEarned,
      averageScore: existingCertificate.averageScore,
      totalLessons: existingCertificate.totalLessons,
      timeSpent: existingCertificate.timeSpent,
      issuedAt: existingCertificate.issuedAt,
    };
  }

  // Get enrollment with related data
  const enrollment = await prisma.courseEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      user: true,
      course: true,
    },
  });

  if (!enrollment) {
    throw new Error('Enrollment not found');
  }

  if (enrollment.status !== 'COMPLETED') {
    throw new Error('Course must be completed before generating certificate');
  }

  if (!enrollment.completedAt) {
    throw new Error('Course completion date not set');
  }

  // Generate unique identifiers
  const certificateNumber = await generateCertificateNumber();
  const verificationCode = await generateVerificationCode();

  // Create certificate
  const certificate = await prisma.courseCertificate.create({
    data: {
      enrollmentId: enrollment.id,
      certificateNumber,
      verificationCode,
      studentName: enrollment.user.name || 'Student',
      courseTitle: enrollment.course.title,
      completionDate: enrollment.completedAt,
      totalXPEarned: enrollment.totalXPEarned,
      averageScore: enrollment.averageScore,
      totalLessons: enrollment.totalLessons,
      timeSpent: calculateTotalTimeSpent(enrollmentId),
    },
  });

  // Update enrollment to mark certificate as earned
  await prisma.courseEnrollment.update({
    where: { id: enrollmentId },
    data: { certificateEarned: true },
  });

  return {
    id: certificate.id,
    certificateNumber: certificate.certificateNumber,
    verificationCode: certificate.verificationCode,
    studentName: certificate.studentName,
    courseTitle: certificate.courseTitle,
    completionDate: certificate.completionDate,
    totalXPEarned: certificate.totalXPEarned,
    averageScore: certificate.averageScore,
    totalLessons: certificate.totalLessons,
    timeSpent: certificate.timeSpent,
    issuedAt: certificate.issuedAt,
  };
}

/**
 * Get certificate by ID
 */
export async function getCertificateById(
  certificateId: string
): Promise<CertificateData | null> {
  const certificate = await prisma.courseCertificate.findUnique({
    where: { id: certificateId },
  });

  if (!certificate) {
    return null;
  }

  return {
    id: certificate.id,
    certificateNumber: certificate.certificateNumber,
    verificationCode: certificate.verificationCode,
    studentName: certificate.studentName,
    courseTitle: certificate.courseTitle,
    completionDate: certificate.completionDate,
    totalXPEarned: certificate.totalXPEarned,
    averageScore: certificate.averageScore,
    totalLessons: certificate.totalLessons,
    timeSpent: certificate.timeSpent,
    issuedAt: certificate.issuedAt,
  };
}

/**
 * Get certificate by certificate number (for verification)
 */
export async function getCertificateByCertificateNumber(
  certificateNumber: string
): Promise<CertificateData | null> {
  const certificate = await prisma.courseCertificate.findUnique({
    where: { certificateNumber },
  });

  if (!certificate) {
    return null;
  }

  return {
    id: certificate.id,
    certificateNumber: certificate.certificateNumber,
    verificationCode: certificate.verificationCode,
    studentName: certificate.studentName,
    courseTitle: certificate.courseTitle,
    completionDate: certificate.completionDate,
    totalXPEarned: certificate.totalXPEarned,
    averageScore: certificate.averageScore,
    totalLessons: certificate.totalLessons,
    timeSpent: certificate.timeSpent,
    issuedAt: certificate.issuedAt,
  };
}

/**
 * Get all certificates for a user
 */
export async function getUserCertificates(
  userId: string
): Promise<CertificateData[]> {
  const certificates = await prisma.courseCertificate.findMany({
    where: {
      enrollment: {
        userId,
      },
    },
    orderBy: {
      completionDate: 'desc',
    },
  });

  return certificates.map((cert) => ({
    id: cert.id,
    certificateNumber: cert.certificateNumber,
    verificationCode: cert.verificationCode,
    studentName: cert.studentName,
    courseTitle: cert.courseTitle,
    completionDate: cert.completionDate,
    totalXPEarned: cert.totalXPEarned,
    averageScore: cert.averageScore,
    totalLessons: cert.totalLessons,
    timeSpent: cert.timeSpent,
    issuedAt: cert.issuedAt,
  }));
}

/**
 * Verify a certificate using verification code
 */
export async function verifyCertificate(
  certificateNumber: string,
  verificationCode: string
): Promise<boolean> {
  const certificate = await prisma.courseCertificate.findUnique({
    where: { certificateNumber },
  });

  return certificate?.verificationCode === verificationCode;
}

/**
 * Helper function to calculate total time spent on course
 * (This is a placeholder - should sum up lesson progress times)
 */
async function calculateTotalTimeSpent(enrollmentId: string): Promise<number> {
  const lessonProgress = await prisma.courseLessonProgress.findMany({
    where: { enrollmentId },
  });

  return lessonProgress.reduce((total, progress) => total + progress.timeSpent, 0);
}
