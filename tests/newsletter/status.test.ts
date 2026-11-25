import { afterEach, describe, expect, it, vi } from 'vitest';
import { getNewsletterConfig, getNewsletterStatus } from '@/lib/newsletter';

describe('newsletter status', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('is a preview on a laptop or Vercel preview before Kit is connected', () => {
    vi.stubEnv('NEWSLETTER_API_KEY', '');
    vi.stubEnv('NEWSLETTER_FORM_ID', '');
    vi.stubEnv('VERCEL_ENV', 'preview');
    expect(getNewsletterStatus()).toBe('preview');
  });

  it('says "coming soon" on the live site before Kit is connected', () => {
    vi.stubEnv('NEWSLETTER_API_KEY', '');
    vi.stubEnv('NEWSLETTER_FORM_ID', '');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(getNewsletterStatus()).toBe('coming-soon');
  });

  it('stays "coming soon" with a key but no form ID', () => {
    vi.stubEnv('NEWSLETTER_API_KEY', 'test-key');
    vi.stubEnv('NEWSLETTER_FORM_ID', '');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(getNewsletterStatus()).toBe('coming-soon');
  });

  it('ignores a form ID that is not a number', () => {
    vi.stubEnv('NEWSLETTER_API_KEY', 'test-key');
    vi.stubEnv('NEWSLETTER_FORM_ID', 'abc');
    expect(getNewsletterConfig()).toBeNull();
  });

  it('is live once the API key and form ID are set', () => {
    vi.stubEnv('NEWSLETTER_API_KEY', 'test-key');
    vi.stubEnv('NEWSLETTER_FORM_ID', '123');
    vi.stubEnv('VERCEL_ENV', 'production');
    expect(getNewsletterStatus()).toBe('live');
  });

  it('reads the parent and educator tags when they are set', () => {
    vi.stubEnv('NEWSLETTER_API_KEY', 'test-key');
    vi.stubEnv('NEWSLETTER_FORM_ID', '123');
    vi.stubEnv('NEWSLETTER_TAG_PARENT_ID', '11');
    vi.stubEnv('NEWSLETTER_TAG_EDUCATOR_ID', '');
    expect(getNewsletterConfig()?.tagIds).toEqual({ parent: '11' });
  });
});
