'use client';

import CampusDemoExperience from '@/components/demo/CampusDemoExperience';

/**
 * /dev/campus-sandbox — DEVELOPMENT-ONLY harness for the campus demo. The
 * same experience is public at /demo/play; this route stays for testing
 * without the site chrome (see the Test Games workflow in CLAUDE.md:
 * registered ≠ cataloged).
 *
 * Renders nothing in production builds.
 */
export default function CampusSandboxPage() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return <CampusDemoExperience />;
}
