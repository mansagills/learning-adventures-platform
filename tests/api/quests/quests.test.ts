import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ─── Prisma mock ──────────────────────────────────────────────────────────────
const prismaMock = vi.hoisted(() => ({
  quest: { findMany: vi.fn(), findUnique: vi.fn() },
  questCompletion: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
  userLevel: { upsert: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

// ─── Auth mock ────────────────────────────────────────────────────────────────
vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockResolvedValue({ apiUser: { id: 'user-1', email: 'student@test.com' }, error: null }),
}));

// ─── Import routes AFTER mocks ────────────────────────────────────────────────
import { GET } from '@/app/api/quests/active/route';
import { POST } from '@/app/api/quests/complete/route';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
const starterQuest = {
  id: 'cuid-1',
  questId: 'fraction-fundamentals',
  title: 'Fraction Fundamentals',
  description: 'Master fractions.',
  subject: 'MATH',
  buildingId: 'math-building',
  xpReward: 50,
  coinReward: 25,
  objectives: [{ id: 'obj-1', label: 'Complete Fraction Frenzy' }],
  prerequisites: [],
  order: 1,
};

const chainQuest = {
  id: 'cuid-2',
  questId: 'multiplication-mastery',
  title: 'Multiplication Mastery',
  description: 'Conquer multiplication.',
  subject: 'MATH',
  buildingId: 'math-building',
  xpReward: 75,
  coinReward: 35,
  objectives: [{ id: 'obj-2', label: 'Complete Times Tables' }],
  prerequisites: ['fraction-fundamentals'],
  order: 2,
};

const deepChainQuest = {
  id: 'cuid-3',
  questId: 'math-champion',
  title: 'Math Champion',
  description: 'Prove your math mastery.',
  subject: 'MATH',
  buildingId: 'math-building',
  xpReward: 100,
  coinReward: 50,
  objectives: [{ id: 'obj-3', label: 'Complete all math quests' }],
  prerequisites: ['fraction-fundamentals', 'multiplication-mastery'],
  order: 3,
};

function makeRequest(body?: object): NextRequest {
  return new NextRequest('http://localhost/api/quests/complete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

// ─── GET /api/quests/active ───────────────────────────────────────────────────
describe('GET /api/quests/active', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns starter quest as available when no completions', async () => {
    prismaMock.quest.findMany.mockResolvedValue([starterQuest]);
    prismaMock.questCompletion.findMany.mockResolvedValue([]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.quests).toHaveLength(1);
    expect(body.quests[0].status).toBe('available');
  });

  it('returns chain quest as locked when prereq not completed', async () => {
    prismaMock.quest.findMany.mockResolvedValue([starterQuest, chainQuest]);
    prismaMock.questCompletion.findMany.mockResolvedValue([]);

    const res = await GET();
    const { quests } = await res.json();

    const chain = quests.find((q: { questId: string }) => q.questId === 'multiplication-mastery');
    expect(chain.status).toBe('locked');
  });

  it('returns chain quest as available when prereq is completed', async () => {
    prismaMock.quest.findMany.mockResolvedValue([starterQuest, chainQuest]);
    prismaMock.questCompletion.findMany.mockResolvedValue([{ questId: 'fraction-fundamentals' }]);

    const res = await GET();
    const { quests } = await res.json();

    const chain = quests.find((q: { questId: string }) => q.questId === 'multiplication-mastery');
    expect(chain.status).toBe('available');
  });

  it('returns deep chain quest as active when some but not all prereqs are completed', async () => {
    prismaMock.quest.findMany.mockResolvedValue([starterQuest, chainQuest, deepChainQuest]);
    prismaMock.questCompletion.findMany.mockResolvedValue([{ questId: 'fraction-fundamentals' }]);

    const res = await GET();
    const { quests } = await res.json();

    const deep = quests.find((q: { questId: string }) => q.questId === 'math-champion');
    expect(deep.status).toBe('active');
  });

  it('returns quest as completed when it appears in completions', async () => {
    prismaMock.quest.findMany.mockResolvedValue([starterQuest]);
    prismaMock.questCompletion.findMany.mockResolvedValue([{ questId: 'fraction-fundamentals' }]);

    const res = await GET();
    const { quests } = await res.json();

    expect(quests[0].status).toBe('completed');
  });

  it('guards objectives field — returns empty array when objectives is null', async () => {
    prismaMock.quest.findMany.mockResolvedValue([{ ...starterQuest, objectives: null }]);
    prismaMock.questCompletion.findMany.mockResolvedValue([]);

    const res = await GET();
    const { quests } = await res.json();

    expect(quests[0].objectives).toEqual([]);
  });

  it('returns 401 when unauthenticated', async () => {
    const { getApiUser } = await import('@/lib/api-auth');
    const mockError = Response.json({ error: 'Unauthorized' }, { status: 401 });
    vi.mocked(getApiUser).mockResolvedValueOnce({ apiUser: null as never, error: mockError });

    const res = await GET();
    expect(res.status).toBe(401);
  });
});

// ─── POST /api/quests/complete ────────────────────────────────────────────────
describe('POST /api/quests/complete', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when questId is missing', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 404 when quest does not exist', async () => {
    prismaMock.quest.findUnique.mockResolvedValue(null);

    const res = await POST(makeRequest({ questId: 'nonexistent-quest' }));
    expect(res.status).toBe(404);
  });

  it('returns 409 when quest already completed', async () => {
    prismaMock.quest.findUnique.mockResolvedValue(starterQuest);
    prismaMock.questCompletion.findUnique.mockResolvedValue({ questId: 'fraction-fundamentals', userId: 'user-1' });

    const res = await POST(makeRequest({ questId: 'fraction-fundamentals' }));
    expect(res.status).toBe(409);
  });

  it('returns 401 when unauthenticated', async () => {
    const { getApiUser } = await import('@/lib/api-auth');
    const mockError = Response.json({ error: 'Unauthorized' }, { status: 401 });
    vi.mocked(getApiUser).mockResolvedValueOnce({ apiUser: null as never, error: mockError });

    const res = await POST(makeRequest({ questId: 'fraction-fundamentals' }));
    expect(res.status).toBe(401);
  });
});
