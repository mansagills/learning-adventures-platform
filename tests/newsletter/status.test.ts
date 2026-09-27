import { afterEach, describe, expect, it, vi } from 'vitest';
import { getNewsletterStatus } from '@/lib/newsletter';

describe('newsletter status', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is a preview on a laptop or Vercel preview before Kit is connected', () => {
    vi.stubEnv('NEWSLETTER_API_KEY', '');
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(getNewsletterStatus()).toBe('preview');
  });

  it('says "coming soon" on the live site before Kit is connected', () => {
    vi.stubEnv('NEWSLETTER_API_KEY', '');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(getNewsletterStatus()).toBe('coming-soon');
  });

  it('is live once the API key is set', () => {
    vi.stubEnv('NEWSLETTER_API_KEY', 'test-key');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(getNewsletterStatus()).toBe('live');
  });
});
