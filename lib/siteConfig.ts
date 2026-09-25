/**
 * Site-wide configuration for the public Learning Adventures website.
 *
 * Everything here is safe to ship to the browser. Values come from
 * NEXT_PUBLIC_* env vars when set, and fall back to defaults that let the site
 * run with no env vars at all (no database, no auth, no secrets).
 */

export const siteConfig = {
  name: 'Learning Adventures',
  tagline: 'Play. Read. Explore.',

  features: {
    /**
     * Accounts, dashboards, courses, the full campus world and admin tools.
     * Off for v1: those routes redirect home and their nav links are hidden.
     * The code stays in place so it can be switched back on later by setting
     * NEXT_PUBLIC_ENABLE_ACCOUNTS=true.
     */
    accounts: process.env.NEXT_PUBLIC_ENABLE_ACCOUNTS === 'true',
  },

  links: {
    /** Storefront for the interactive ebooks. Individual books can override it. */
    ebookStore: process.env.NEXT_PUBLIC_EBOOK_STORE_URL || '',
    /** YouTube/Vimeo embed URL for the Learning Adventures World demo trailer. */
    demoTrailer: process.env.NEXT_PUBLIC_DEMO_TRAILER_URL || '',
    /** Optional sign-up form (e.g. for "tell me when the books launch"). */
    newsletter: process.env.NEXT_PUBLIC_NEWSLETTER_URL || '',
  },
} as const;

/**
 * Routes that belong to the account-based platform. When
 * `siteConfig.features.accounts` is off, middleware redirects these to `/`.
 */
export const ACCOUNT_ONLY_ROUTES = [
  '/login',
  '/auth',
  '/child',
  '/parent',
  '/teacher',
  '/courses',
  '/progress',
  '/profile',
  '/my-library',
  '/practice',
  '/assessments',
  '/tutorials',
  '/course-request',
  '/my-requests',
  '/world',
  '/agents',
  '/certificates',
  '/test-progress',
] as const;

/** True when `pathname` is `route` itself or nested under it. */
export function matchesRoute(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isAccountOnlyRoute(pathname: string): boolean {
  return ACCOUNT_ONLY_ROUTES.some((route) => matchesRoute(pathname, route));
}
