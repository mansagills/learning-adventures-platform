import Link from 'next/link';
import ContentPage from '@/components/ContentPage';
import { siteConfig } from '@/lib/siteConfig';
import { generateMetadata as seoMetadata } from '@/lib/seo';

export const metadata = seoMetadata({
  title: 'Terms of Use | Learning Adventures',
  description: 'The terms for using the Learning Adventures website.',
  path: '/terms',
});

/** DRAFT terms of use. Set `draft` to false once reviewed. */
export default function TermsPage() {
  const { contactEmail } = siteConfig.links;

  return (
    <ContentPage
      eyebrow="Terms"
      title="Terms of use"
      intro={
        <p>
          By using the Learning Adventures website, you agree to these terms. If
          you&apos;re a child, please read them with a parent or guardian.
        </p>
      }
      draft
      updated="September 2026"
    >
      <h2>Using the site</h2>
      <p>
        You&apos;re welcome to play the games, read the free ebook samples and
        try the Learning Adventures World demo for personal and classroom
        learning. Please don&apos;t try to disrupt the site, copy it, or use it
        for anything unlawful.
      </p>

      <h2>Our content</h2>
      <p>
        The games, stories, characters (including Jaylen and SPARK), artwork and
        other content on this site belong to Learning Adventures or its
        licensors. You may not reproduce or sell them without permission.
      </p>

      <h2>Interactive ebooks</h2>
      <p>
        Interactive ebooks are bought and read in a separate ebook reader. Your
        purchase and use of an ebook are also covered by that service&apos;s own
        terms.
      </p>

      <h2>The demo</h2>
      <p>
        The <Link href="/demo">Learning Adventures World demo</Link> is an early
        preview. Features may change or be removed, and progress may be reset.
      </p>

      <h2>No warranties</h2>
      <p>
        We work hard to keep everything running, but the site is provided
        &ldquo;as is&rdquo; and we can&apos;t promise it will always be
        available or error-free.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The date at the top of this page shows when
        they last changed.
      </p>

      <h2>Contact</h2>
      <p>
        {contactEmail ? (
          <>
            Questions? Email{' '}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </>
        ) : (
          'Contact details will be added here.'
        )}
      </p>
    </ContentPage>
  );
}
