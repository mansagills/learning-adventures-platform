/**
 * Newsletter sign-ups. Server-only: it reads settings that never reach the
 * browser, including the Kit API key.
 *
 * Sign-ups go to Kit (formerly ConvertKit), the email service chosen for UX-2.
 * This is the only file that knows which service we use: switching to another
 * one means changing `subscribeToNewsletter` and the env vars below.
 *
 * Settings (set in Vercel, never committed):
 * - NEWSLETTER_API_KEY: the Kit v4 API key (secret; no NEXT_PUBLIC_ prefix, so
 *   it never reaches the browser).
 * - NEWSLETTER_FORM_ID: the number of the Kit form people are added to. The
 *   form's own settings in Kit decide the double opt-in ("confirm your
 *   subscription") email.
 * - NEWSLETTER_TAG_PARENT_ID, NEWSLETTER_TAG_EDUCATOR_ID (optional): Kit tag
 *   numbers, so emails can be sent to parents or educators only.
 *
 * Status (what the /newsletter page shows):
 * - 'live': the API key and form ID are set, so the form sends sign-ups to Kit.
 * - 'preview': not connected, and this isn't the live site (a laptop or a
 *   Vercel preview). The form can be tried out, but nothing is sent.
 * - 'coming-soon': not connected, on the live site. The page says sign-ups
 *   open soon, and sign-up boxes elsewhere on the site stay hidden.
 */

export type NewsletterStatus = 'live' | 'preview' | 'coming-soon';

/** Who is signing up. Each one can map to its own Kit tag. */
export const NEWSLETTER_AUDIENCES = ['parent', 'educator'] as const;
export type NewsletterAudience = (typeof NEWSLETTER_AUDIENCES)[number];

export interface NewsletterConfig {
  apiKey: string;
  formId: string;
  tagIds: Partial<Record<NewsletterAudience, string>>;
}

const ID_PATTERN = /^\d+$/;

/** The Kit settings, or null when the newsletter isn't connected yet. */
export function getNewsletterConfig(): NewsletterConfig | null {
  const apiKey = process.env.NEWSLETTER_API_KEY?.trim();
  const formId = process.env.NEWSLETTER_FORM_ID?.trim();
  if (!apiKey || !formId || !ID_PATTERN.test(formId)) return null;

  const tagIds: NewsletterConfig['tagIds'] = {};
  const parentTag = process.env.NEWSLETTER_TAG_PARENT_ID?.trim();
  const educatorTag = process.env.NEWSLETTER_TAG_EDUCATOR_ID?.trim();
  if (parentTag && ID_PATTERN.test(parentTag)) tagIds.parent = parentTag;
  if (educatorTag && ID_PATTERN.test(educatorTag))
    tagIds.educator = educatorTag;

  return { apiKey, formId, tagIds };
}

export function getNewsletterStatus(): NewsletterStatus {
  if (getNewsletterConfig()) return 'live';
  if (process.env.VERCEL_ENV === 'production') return 'coming-soon';
  return 'preview';
}

// ── Checking a sign-up ──────────────────────────────────────────────────────

export interface NewsletterSignup {
  email: string;
  firstName: string;
  lastName: string;
  audience: NewsletterAudience;
}

export type SignupCheck =
  | { ok: true; signup: NewsletterSignup }
  /** A bot filled in the hidden field: pretend it worked, send nothing. */
  | { ok: true; bot: true }
  | { ok: false; error: string };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME = 50;
const MAX_EMAIL = 254;

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * Checks what the form sent, the same way the form itself does, because
 * anyone can post to the API route without using the form.
 */
export function checkSignup(body: unknown): SignupCheck {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'Missing sign-up details.' };
  }
  const data = body as Record<string, unknown>;

  if (text(data.website)) return { ok: true, bot: true };

  const email = text(data.email).toLowerCase();
  const firstName = text(data.firstName);
  const lastName = text(data.lastName);
  const audience = data.audience;

  if (!firstName || firstName.length > MAX_NAME) {
    return { ok: false, error: 'Please enter your first name.' };
  }
  if (lastName.length > MAX_NAME) {
    return { ok: false, error: 'Please enter a shorter last name.' };
  }
  if (email.length > MAX_EMAIL || !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (
    typeof audience !== 'string' ||
    !(NEWSLETTER_AUDIENCES as readonly string[]).includes(audience)
  ) {
    return {
      ok: false,
      error: 'Please choose whether you are a parent or an educator.',
    };
  }
  if (data.isAdult !== true) {
    return {
      ok: false,
      error: 'Please confirm you are 18 or older.',
    };
  }

  return {
    ok: true,
    signup: {
      email,
      firstName,
      lastName,
      audience: audience as NewsletterAudience,
    },
  };
}

// ── Sending a sign-up to Kit ────────────────────────────────────────────────

const KIT_API = 'https://api.kit.com/v4';

export class NewsletterError extends Error {}

/**
 * Adds someone to the Kit form (and their parent or educator tag).
 *
 * 1. Create the subscriber as "inactive". Kit's default is "active", which
 *    would skip the "confirm your subscription" email; inactive people only
 *    become active once they click the link in it.
 * 2. Add them to the form. This is what sends the form's confirmation email.
 * 3. Tag them as a parent or an educator, if that tag is set up.
 *
 * `fetchImpl` is there so tests can stand in for Kit.
 */
export async function subscribeToNewsletter(
  signup: NewsletterSignup,
  config: NewsletterConfig,
  {
    fetchImpl = fetch,
    referrer,
  }: { fetchImpl?: typeof fetch; referrer?: string } = {}
): Promise<void> {
  async function kit(path: string, body: Record<string, unknown>) {
    const response = await fetchImpl(`${KIT_API}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Kit-Api-Key': config.apiKey,
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    if (!response.ok) {
      // Kit's error text can echo what was sent, so log only the status.
      throw new NewsletterError(`Kit ${path} returned ${response.status}`);
    }
  }

  const subscriber: Record<string, unknown> = {
    email_address: signup.email,
    first_name: signup.firstName,
    state: 'inactive',
  };
  // `last_name` is a custom field on the Kit account. Only send it when it
  // was filled in, so an account without that field still works.
  if (signup.lastName) subscriber.fields = { last_name: signup.lastName };

  try {
    await kit('/subscribers', subscriber);
  } catch (error) {
    // If the account has no `last_name` field, Kit may refuse the request.
    // Try again without it rather than lose the sign-up.
    if (!subscriber.fields) throw error;
    delete subscriber.fields;
    await kit('/subscribers', subscriber);
  }
  await kit(`/forms/${config.formId}/subscribers`, {
    email_address: signup.email,
    ...(referrer ? { referrer } : {}),
  });

  const tagId = config.tagIds[signup.audience];
  if (tagId) {
    await kit(`/tags/${tagId}/subscribers`, { email_address: signup.email });
  }
}
