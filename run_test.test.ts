import { describe, it } from 'vitest';
import { POST } from './app/api/auth/signup/route';
import { NextRequest } from 'next/server';
import { vi } from 'vitest';

const { prismaMock } = vi.hoisted(() => {
  return {
    prismaMock: {
      user: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    },
  };
});
vi.mock('./lib/prisma', () => ({ prisma: prismaMock }));

vi.mock('./lib/supabase/server', () => ({
  createServiceClient: vi.fn().mockReturnValue({
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'mock-supabase-id' } },
          error: null
        })
      }
    }
  })
}));

describe('test', () => {
  it('runs', async () => {
    const req = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'password123', role: 'STUDENT' })
    });
    const res = await POST(req);
    console.log(res.status, await res.json());
  });
});
