import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/course-requests/submit/route';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

const mockUpdate = vi.fn();
const mockCreate = vi.fn();
const mockFindUniqueUser = vi.fn();
const mockFindUniqueRequest = vi.fn();

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => mockFindUniqueUser(...args),
    },
    courseRequest: {
      update: (...args: any[]) => mockUpdate(...args),
      create: (...args: any[]) => mockCreate(...args),
      findUnique: (...args: any[]) => mockFindUniqueRequest(...args),
    },
  },
}));

describe('Course Request Submit IDOR and Mass Assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getServerSession as any).mockResolvedValue({
      user: { id: 'attacker123' },
    });
    mockFindUniqueUser.mockResolvedValue({
      role: 'TEACHER',
      email: 'attacker@test.com',
    });
  });

  it("should return 403 Forbidden when attempting an IDOR update on another user's draft", async () => {
    // Mock existing draft to belong to a different user ('victim123')
    mockFindUniqueRequest.mockResolvedValue({
      id: 'victim-draft-id',
      userId: 'victim123',
    });

    const body = {
      id: 'victim-draft-id',
      fullName: 'Attacker',
      email: 'attacker@test.com',
      role: 'TEACHER',
      studentName: 'Attacker Jr',
      studentAge: 10,
      gradeLevel: '5th',
      primarySubject: 'Math',
      consentGiven: true,
    };

    const req = new NextRequest('http://localhost/api/course-requests/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(req);

    expect(response.status).toBe(403);
    const data = await response.json();
    expect(data.error).toBe('Forbidden to update this request');
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('should prevent mass assignment of userId when creating a new request', async () => {
    mockCreate.mockResolvedValue({ id: 'new-request-id' });

    const body = {
      fullName: 'Attacker',
      email: 'attacker@test.com',
      role: 'TEACHER',
      studentName: 'Attacker Jr',
      studentAge: 10,
      gradeLevel: '5th',
      primarySubject: 'Math',
      consentGiven: true,
      userId: 'admin-id-injection', // Attempting to inject a different user ID
    };

    const req = new NextRequest('http://localhost/api/course-requests/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'attacker123', // Expecting it to use session.user.id
          isDraft: false,
          status: 'SUBMITTED',
        }),
      })
    );

    // Explicitly verify the injected userId was NOT used
    const createCallData = mockCreate.mock.calls[0][0].data;
    expect(createCallData.userId).not.toBe('admin-id-injection');
  });

  it('should prevent mass assignment of userId when updating an existing request', async () => {
    // Mock existing draft to belong to the attacker (so they pass the IDOR check)
    mockFindUniqueRequest.mockResolvedValue({
      id: 'attacker-draft-id',
      userId: 'attacker123',
    });
    mockUpdate.mockResolvedValue({ id: 'attacker-draft-id' });

    const body = {
      id: 'attacker-draft-id',
      fullName: 'Attacker',
      email: 'attacker@test.com',
      role: 'TEACHER',
      studentName: 'Attacker Jr',
      studentAge: 10,
      gradeLevel: '5th',
      primarySubject: 'Math',
      consentGiven: true,
      userId: 'admin-id-injection', // Attempting to inject a different user ID
    };

    const req = new NextRequest('http://localhost/api/course-requests/submit', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const updateCallData = mockUpdate.mock.calls[0][0].data;
    // Verify `userId` was stripped from the data spread entirely during update
    expect(updateCallData.userId).toBeUndefined();
  });
});
