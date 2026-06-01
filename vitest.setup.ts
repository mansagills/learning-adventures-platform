import { vi } from 'vitest';

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'placeholder_anon_key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'service_role_key';

vi.mock('@/lib/supabase/server', () => ({
  createServiceClient: vi.fn(() => ({
    auth: {
      admin: {
        createUser: vi.fn().mockResolvedValue({
          data: {
            user: {
              id: 'mock-supabase-id-123'
            }
          },
          error: null
        })
      }
    }
  })),
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-uid' } },
        error: null
      })
    }
  }))
}));
