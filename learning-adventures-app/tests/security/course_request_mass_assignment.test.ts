import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as submitPost } from '@/app/api/course-requests/submit/route';
import { PUT as draftPut, POST as draftPost } from '@/app/api/course-requests/draft/route';

// Mock dependencies
const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  courseRequest: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}));

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

// Import after mocks
import { getServerSession } from 'next-auth';

describe('Security: Course Request Mass Assignment', () => {
  const mockUserId = 'user-123';
  const mockCourseRequestId = 'request-456';

  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({
      user: { id: mockUserId },
    });
    mockPrisma.user.findUnique.mockResolvedValue({ role: 'TEACHER', email: 'teacher@test.com' });
  });

  it('submit route should ignore id and userId from body when updating', async () => {
    mockPrisma.courseRequest.findUnique.mockResolvedValue({
      id: mockCourseRequestId,
      userId: mockUserId, // user owns it
    });

    mockPrisma.courseRequest.update.mockResolvedValue({
      id: mockCourseRequestId,
      userId: mockUserId,
      status: 'SUBMITTED',
    });

    const maliciousBody = {
      id: mockCourseRequestId,
      userId: 'hacked-user-id', // Try to reassign to someone else
      // Required fields
      fullName: 'Test User',
      email: 'test@test.com',
      role: 'TEACHER',
      studentName: 'Student',
      studentAge: 10,
      gradeLevel: '5th',
      primarySubject: 'Math',
      consentGiven: true
    };

    const req = new NextRequest('http://localhost/api/course-requests/submit', {
      method: 'POST',
      body: JSON.stringify(maliciousBody),
    });

    const res = await submitPost(req);
    expect(res.status).toBe(200);

    // Verify what was actually passed to prisma.update
    const updateCallArgs = mockPrisma.courseRequest.update.mock.calls[0][0];
    expect(updateCallArgs.data.userId).toBeUndefined(); // Should be explicitly stripped/undefined
  });

  it('draft PUT route should ignore id and userId from body when updating', async () => {
    mockPrisma.courseRequest.findUnique.mockResolvedValue({
      id: mockCourseRequestId,
      userId: mockUserId, // user owns it
      updatedAt: new Date(Date.now() - 10000), // old date
    });

    mockPrisma.courseRequest.update.mockResolvedValue({
      id: mockCourseRequestId,
      updatedAt: new Date(),
    });

    const maliciousBody = {
      id: mockCourseRequestId,
      userId: 'hacked-user-id', // Try to reassign to someone else
      studentName: 'Draft Student',
    };

    const req = new NextRequest('http://localhost/api/course-requests/draft', {
      method: 'PUT',
      body: JSON.stringify(maliciousBody),
    });

    const res = await draftPut(req);
    expect(res.status).toBe(200);

    // Verify what was actually passed to prisma.update
    const updateCallArgs = mockPrisma.courseRequest.update.mock.calls[0][0];
    expect(updateCallArgs.data.userId).toBeUndefined(); // Should be explicitly stripped/undefined
  });

  it('draft POST route should force userId to session user when creating', async () => {
    mockPrisma.courseRequest.findFirst.mockResolvedValue(null); // No existing draft

    mockPrisma.courseRequest.create.mockResolvedValue({
      id: 'new-draft-id',
      updatedAt: new Date(),
    });

    const maliciousBody = {
      userId: 'hacked-user-id', // Try to assign to someone else
      studentName: 'New Draft Student',
    };

    const req = new NextRequest('http://localhost/api/course-requests/draft', {
      method: 'POST',
      body: JSON.stringify(maliciousBody),
    });

    const res = await draftPost(req);
    expect(res.status).toBe(200);

    // Verify what was actually passed to prisma.create
    const createCallArgs = mockPrisma.courseRequest.create.mock.calls[0][0];
    expect(createCallArgs.data.userId).toBe(mockUserId); // Must be the session user
  });
});
