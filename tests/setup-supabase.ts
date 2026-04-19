import { vi } from 'vitest';
vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-uid' } }, error: null }),
      },
    },
  })),
}));
