import { redirect } from 'next/navigation';

/**
 * This deployment is a standalone snapshot published solely to showcase the
 * Gather-style campus demo (see /dev/campus-sandbox). The full marketing
 * homepage depends on Supabase env vars this deploy doesn't set, so the root
 * route skips it entirely and goes straight to the demo.
 */
export default function HomePage() {
  redirect('/dev/campus-sandbox');
}
