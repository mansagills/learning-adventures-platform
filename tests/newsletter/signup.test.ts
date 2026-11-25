import { describe, expect, it, vi } from 'vitest';
import {
  checkSignup,
  subscribeToNewsletter,
  type NewsletterConfig,
} from '@/lib/newsletter';

const good = {
  email: ' Sam@Example.com ',
  firstName: ' Sam ',
  lastName: '',
  audience: 'parent',
  isAdult: true,
  website: '',
};

describe('checkSignup', () => {
  it('accepts a complete sign-up and tidies it', () => {
    expect(checkSignup(good)).toEqual({
      ok: true,
      signup: {
        email: 'sam@example.com',
        firstName: 'Sam',
        lastName: '',
        audience: 'parent',
      },
    });
  });

  it('treats a filled-in hidden field as a bot', () => {
    expect(checkSignup({ ...good, website: 'spam.example' })).toEqual({
      ok: true,
      bot: true,
    });
  });

  it.each([
    ['no body', null],
    ['no first name', { ...good, firstName: ' ' }],
    ['a bad email', { ...good, email: 'not-an-email' }],
    ['no audience', { ...good, audience: undefined }],
    ['an unknown audience', { ...good, audience: 'student' }],
    ['no age box', { ...good, isAdult: false }],
    ['a too-long name', { ...good, firstName: 'x'.repeat(51) }],
  ])('rejects %s', (_label, body) => {
    expect(checkSignup(body).ok).toBe(false);
  });
});

describe('subscribeToNewsletter', () => {
  const config: NewsletterConfig = {
    apiKey: 'test-key',
    formId: '123',
    tagIds: { parent: '11', educator: '22' },
  };

  function fakeKit(statuses: number[] = []) {
    const queue = [...statuses];
    return vi.fn(
      async () => new Response('{}', { status: queue.shift() ?? 201 })
    );
  }

  function calls(fetchImpl: ReturnType<typeof fakeKit>) {
    return fetchImpl.mock.calls.map(([url, init]) => ({
      url: String(url),
      body: JSON.parse(String((init as RequestInit).body)),
      key: ((init as RequestInit).headers as Record<string, string>)[
        'X-Kit-Api-Key'
      ],
    }));
  }

  it('creates an inactive subscriber, adds them to the form, then tags them', async () => {
    const fetchImpl = fakeKit();
    await subscribeToNewsletter(
      {
        email: 'sam@example.com',
        firstName: 'Sam',
        lastName: 'Lee',
        audience: 'educator',
      },
      config,
      { fetchImpl, referrer: 'https://learningadventures.org/newsletter' }
    );

    expect(calls(fetchImpl)).toEqual([
      {
        url: 'https://api.kit.com/v4/subscribers',
        key: 'test-key',
        body: {
          email_address: 'sam@example.com',
          first_name: 'Sam',
          state: 'inactive',
          fields: { last_name: 'Lee' },
        },
      },
      {
        url: 'https://api.kit.com/v4/forms/123/subscribers',
        key: 'test-key',
        body: {
          email_address: 'sam@example.com',
          referrer: 'https://learningadventures.org/newsletter',
        },
      },
      {
        url: 'https://api.kit.com/v4/tags/22/subscribers',
        key: 'test-key',
        body: { email_address: 'sam@example.com' },
      },
    ]);
  });

  it('skips the tag when none is set up for that audience', async () => {
    const fetchImpl = fakeKit();
    await subscribeToNewsletter(
      { email: 'a@b.co', firstName: 'A', lastName: '', audience: 'parent' },
      { ...config, tagIds: {} },
      { fetchImpl }
    );
    expect(calls(fetchImpl).map((call) => call.url)).toEqual([
      'https://api.kit.com/v4/subscribers',
      'https://api.kit.com/v4/forms/123/subscribers',
    ]);
  });

  it('retries without the last name if Kit refuses the custom field', async () => {
    const fetchImpl = fakeKit([422]);
    await subscribeToNewsletter(
      { email: 'a@b.co', firstName: 'A', lastName: 'B', audience: 'parent' },
      config,
      { fetchImpl }
    );
    const sent = calls(fetchImpl);
    expect(sent[1].url).toBe('https://api.kit.com/v4/subscribers');
    expect(sent[1].body.fields).toBeUndefined();
    expect(sent).toHaveLength(4);
  });

  it('fails when Kit refuses the form', async () => {
    const fetchImpl = fakeKit([201, 404]);
    await expect(
      subscribeToNewsletter(
        { email: 'a@b.co', firstName: 'A', lastName: '', audience: 'parent' },
        config,
        { fetchImpl }
      )
    ).rejects.toThrow('returned 404');
  });
});
