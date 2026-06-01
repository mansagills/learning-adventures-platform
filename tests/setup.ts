import { vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';

// Make jest compatible with vitest
(globalThis as any).jest = vi;

// Make React available globally for tests
(globalThis as any).React = React;

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
}));

// Mock Next.js image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return React.createElement('img', props);
  },
}));

// Mock analytics
vi.mock('@/lib/analytics', () => ({
  track: vi.fn(),
  analytics: {
    clickCTA: vi.fn(),
    viewSection: vi.fn(),
    openFAQ: vi.fn(),
    submitForm: vi.fn(),
    clickPartnerLogo: vi.fn(),
  },
}));

// Mock intersection observer for animations
(global as any).IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];

  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Mock matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Global mocks for common services
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

vi.mock('@/lib/api-auth', () => ({
  getApiUser: vi.fn().mockResolvedValue({
    apiUser: { id: 'test-user', role: 'ADMIN' },
    error: null
  })
}));
