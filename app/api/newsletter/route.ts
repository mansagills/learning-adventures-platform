/**
 * POST /api/newsletter
 *
 * The newsletter form sends sign-ups here, and this route passes them on to
 * Kit with the secret API key, which stays on the server. Why not send them
 * to Kit straight from the browser? The key would be visible to anyone, and
 * this way we check the email, the age box and the hidden bot field first.
 *
 * Replies:
 * - 200 { ok: true }: Kit has the sign-up and sends the confirmation email.
 * - 400 { error }: something in the form needs fixing (the message says what).
 * - 503 { error }: the newsletter isn't connected yet (no Kit settings).
 * - 502 { error }: Kit didn't accept the sign-up; try again later.
 */

import { NextResponse, type NextRequest } from 'next/server';
import {
  checkSignup,
  getNewsletterConfig,
  subscribeToNewsletter,
} from '@/lib/newsletter';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getNewsletterConfig();
  if (!config) {
    return NextResponse.json(
      { error: 'Newsletter sign-ups are not open yet.' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Missing sign-up details.' },
      { status: 400 }
    );
  }

  const check = checkSignup(body);
  if (!check.ok) {
    return NextResponse.json({ error: check.error }, { status: 400 });
  }
  // A bot filled in the hidden field: say yes, send nothing.
  if ('bot' in check) return NextResponse.json({ ok: true });

  try {
    await subscribeToNewsletter(check.signup, config, {
      referrer: new URL('/newsletter', request.url).toString(),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    // Log the reason (never the email address) so it shows in Vercel logs.
    console.error(
      'Newsletter sign-up failed:',
      error instanceof Error ? error.message : 'unknown error'
    );
    return NextResponse.json(
      { error: 'Sign-up failed. Please try again in a minute.' },
      { status: 502 }
    );
  }
}
