import ContentPage from '@/components/ContentPage';
import { siteConfig } from '@/lib/siteConfig';
import { generateMetadata as seoMetadata } from '@/lib/seo';

export const metadata = seoMetadata({
  title: 'Privacy | Learning Adventures',
  description:
    'How Learning Adventures handles information. Kids can play without an account or any personal information.',
  path: '/privacy',
});

/**
 * DRAFT privacy policy, written from how the v1 site actually works (no
 * accounts, no analytics, progress kept in browser storage). Set `draft` to
 * false once it has been reviewed, and keep it in sync with the site: if
 * accounts, analytics or the newsletter are turned on, this page must change.
 */
export default function PrivacyPage() {
  const { contactEmail } = siteConfig.links;

  return (
    <ContentPage
      eyebrow="Privacy"
      title="Privacy policy"
      intro={
        <p>
          The short version: kids can play every game on this site without an
          account, and we don&apos;t ask for names, emails or any other personal
          information.
        </p>
      }
      draft
      updated="September 2026"
    >
      <h2>What we collect</h2>
      <p>
        This website does not have accounts or sign-up forms, and we don&apos;t
        use analytics or advertising trackers. We don&apos;t collect personal
        information from visitors.
      </p>
      <p>
        Like any website, our hosting provider automatically processes basic
        technical information (such as IP address and browser type) so it can
        deliver pages and keep the site secure.
      </p>

      <h2>What&apos;s saved on your device</h2>
      <p>
        Some games and the Learning Adventures World demo remember progress (for
        example, the name and character picked in the demo, demo points, or a
        high score) using your browser&apos;s local storage. This stays on your
        device and is never sent to us. You can clear it at any time from your
        browser settings, or with the Restart button in the demo.
      </p>

      <h2>Other services</h2>
      <ul>
        <li>
          A few games load fonts from Google Fonts, which means your browser
          contacts Google&apos;s servers to download them.
        </li>
        <li>
          Our interactive ebooks are bought and read in a separate ebook reader
          with its own sign-in. That service has its own privacy policy, which
          applies when you use it.
        </li>
        <li>
          If we show a video (such as a demo trailer), it may be played from a
          video service like YouTube or Vimeo under that service&apos;s privacy
          policy.
        </li>
      </ul>

      <h2>Children&apos;s privacy</h2>
      <p>
        Learning Adventures is made for children in grades K–5. We don&apos;t
        knowingly collect personal information from children. If you believe a
        child has shared personal information with us, please contact us and we
        will delete it.
      </p>

      <h2>Changes</h2>
      <p>
        If we add features that handle personal information (such as accounts),
        we will update this page before they go live.
      </p>

      <h2>Contact</h2>
      <p>
        {contactEmail ? (
          <>
            Questions about privacy? Email{' '}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </>
        ) : (
          'Contact details will be added here.'
        )}
      </p>
    </ContentPage>
  );
}
