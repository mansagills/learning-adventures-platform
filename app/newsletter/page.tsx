import Link from 'next/link';
import Container from '@/components/Container';
import NewsletterForm from '@/components/newsletter/NewsletterForm';
import { getNewsletterStatus } from '@/lib/newsletter';
import { generateMetadata as seoMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/siteConfig';
import SiteIcon, { type IconName } from '@/components/icons/SiteIcon';

export function generateMetadata() {
  return {
    ...seoMetadata({
      title: 'Newsletter for Parents | Learning Adventures',
      description:
        'Get new games, book launches and simple ways to keep learning fun at home, about once a month. For parents and guardians.',
      path: '/newsletter',
    }),
    // Keep the page out of search results until sign-ups are open.
    ...(getNewsletterStatus() === 'live'
      ? {}
      : { robots: { index: false, follow: true } }),
  };
}

const perks: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'controller',
    title: 'New games first',
    text: 'Hear about new games and activities as soon as they go live.',
  },
  {
    icon: 'open-book',
    title: 'Book launches',
    text: 'Be the first to know when a new interactive ebook is ready to read.',
  },
  {
    icon: 'sparkle',
    title: 'Learning ideas',
    text: 'Quick, playful ways to keep kids curious at home.',
  },
];

const promises = [
  'For parents and guardians only. We never ask for a child’s name or email.',
  'About one email a month, with no spam.',
  'Unsubscribe any time with one click at the bottom of every email.',
  'We never sell your email address.',
];

export default function NewsletterPage() {
  const status = getNewsletterStatus();
  const { contactEmail } = siteConfig.links;

  return (
    <div className="pb-20">
      <section className="border-b-2 border-pg-border bg-brand-50">
        <Container size="sm" className="py-12 text-center md:py-16">
          <SiteIcon name="envelope" size={80} />
          <p className="mt-4 font-bold uppercase tracking-wider text-brand-600">
            Newsletter
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold text-ink-900 md:text-5xl">
            Learning adventures in your inbox
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-700">
            A friendly note for parents and guardians: what&apos;s new on the
            site, what&apos;s coming next, and easy ways to make learning fun at
            home.
          </p>
        </Container>
      </section>

      <Container size="sm" className="pt-12">
        <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-start">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink-900">
              What you&apos;ll get
            </h2>
            <ul className="mt-5 space-y-5">
              {perks.map((perk) => (
                <li key={perk.title} className="flex gap-4">
                  <SiteIcon name={perk.icon} size={48} />
                  <div>
                    <h3 className="font-display text-lg font-bold text-ink-900">
                      {perk.title}
                    </h3>
                    <p className="text-ink-700">{perk.text}</p>
                  </div>
                </li>
              ))}
            </ul>

            <h2 className="mt-10 font-display text-2xl font-bold text-ink-900">
              Our promises
            </h2>
            <ul className="mt-4 space-y-2 text-ink-700">
              {promises.map((promise) => (
                <li key={promise} className="flex gap-2">
                  <SiteIcon
                    name="shield"
                    size={22}
                    className="mt-0.5 shrink-0"
                  />
                  <span>{promise}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            {status === 'coming-soon' ? (
              <div className="rounded-3xl border-2 border-dashed border-ink-400 bg-white p-6 text-center md:p-8">
                <SiteIcon name="envelope" size={64} className="opacity-80" />
                <h2 className="mt-3 font-display text-2xl font-bold text-ink-900">
                  Sign-ups open soon
                </h2>
                <p className="mt-2 text-ink-700">
                  We&apos;re getting our first newsletter ready. Check back
                  soon, or{' '}
                  <Link
                    href="/blog"
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    read our blog
                  </Link>{' '}
                  in the meantime.
                </p>
                {contactEmail && (
                  <p className="mt-4 text-sm text-ink-600">
                    Questions? Email{' '}
                    <a
                      href={`mailto:${contactEmail}`}
                      className="font-semibold text-brand-600 hover:underline"
                    >
                      {contactEmail}
                    </a>
                    .
                  </p>
                )}
              </div>
            ) : (
              <>
                {status === 'preview' && (
                  <p
                    role="note"
                    className="mb-4 rounded-2xl border-2 border-dashed border-sunshine-600 bg-sunshine-50 p-4 text-sm font-semibold text-sunshine-700"
                  >
                    Preview: the email service isn&apos;t connected yet, so this
                    form doesn&apos;t send anything. The live site shows
                    &ldquo;Sign-ups open soon&rdquo; instead.
                  </p>
                )}
                <NewsletterForm mode={status} />
                <p className="mt-4 text-center text-sm text-ink-600">
                  Read how we handle your information in our{' '}
                  <Link
                    href="/privacy"
                    className="font-semibold text-brand-600 hover:underline"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              </>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
