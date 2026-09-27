/**
 * Newsletter sign-up status. Server-only: it reads settings that never reach
 * the browser.
 *
 * Sign-ups go to Kit (the email service chosen for UX-2). Until the Kit
 * connection is added (UX-2 Phase 3), the form only works as a preview.
 *
 * - 'live': NEWSLETTER_API_KEY is set, so the form sends sign-ups to Kit.
 * - 'preview': not connected, and this isn't the live site (a laptop or a
 *   Vercel preview). The form can be tried out, but nothing is sent.
 * - 'coming-soon': not connected, on the live site. The page says sign-ups
 *   open soon, and sign-up boxes elsewhere on the site stay hidden.
 */

export type NewsletterStatus = 'live' | 'preview' | 'coming-soon';

export function getNewsletterStatus(): NewsletterStatus {
  if (process.env.NEWSLETTER_API_KEY) return 'live';
  if (process.env.VERCEL_ENV === 'production') return 'coming-soon';
  return 'preview';
}
