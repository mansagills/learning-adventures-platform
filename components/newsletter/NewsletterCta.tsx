import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getNewsletterStatus } from '@/lib/newsletter';
import SiteIcon from '@/components/icons/SiteIcon';

interface NewsletterCtaProps {
  className?: string;
}

/**
 * "Get updates" box that links to /newsletter. Server-only, because it checks
 * whether sign-ups are open; it shows nothing on the live site until they are.
 */
export default function NewsletterCta({ className }: NewsletterCtaProps) {
  if (getNewsletterStatus() === 'coming-soon') return null;

  return (
    <aside
      aria-labelledby="newsletter-cta"
      className={cn(
        'flex flex-col items-center gap-4 rounded-3xl border-2 border-pg-border bg-brand-50 p-6 text-center shadow-pop sm:flex-row sm:text-left',
        className
      )}
    >
      <SiteIcon name="envelope" size={64} />
      <div className="flex-1">
        <h2
          id="newsletter-cta"
          className="!mt-0 font-display text-xl font-bold text-ink-900"
        >
          Get updates for parents
        </h2>
        <p className="mt-1 text-ink-700">
          New games, book launches and simple learning ideas, about once a
          month.
        </p>
      </div>
      <Link
        href="/newsletter"
        className="inline-flex shrink-0 items-center rounded-full border-2 border-pg-border bg-pg-violet px-5 py-2 font-bold !text-white shadow-pop transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:no-underline hover:shadow-pop-hover"
      >
        Sign up
      </Link>
    </aside>
  );
}
