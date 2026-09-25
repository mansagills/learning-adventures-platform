import Container from '@/components/Container';
import { siteConfig } from '@/lib/siteConfig';
import Hero from './Hero';
import Benefits from './Benefits';
import HowItWorks from './HowItWorks';
import SecondaryCta from './SecondaryCta';
import Faq from './Faq';

/**
 * Landing page for the Learning Adventures World demo (/demo). This was the
 * site's homepage when it was built around the world; it's now an honest,
 * early-preview showcase that leads to the playable demo at /demo/play.
 *
 * SocialProof.tsx (sample testimonials) is intentionally not rendered: the
 * quotes weren't from real users. Bring it back only with real reviews.
 */
export default function DemoLanding() {
  const trailer = siteConfig.links.demoTrailer;

  return (
    <>
      <Hero />
      {trailer && (
        <section className="bg-white py-16" aria-label="Demo trailer">
          <Container size="sm">
            <div className="relative aspect-video overflow-hidden rounded-3xl border-2 border-pg-border shadow-pop">
              <iframe
                src={trailer}
                title="Learning Adventures World demo trailer"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </Container>
        </section>
      )}
      <HowItWorks />
      <Benefits />
      <SecondaryCta />
      <Faq />
    </>
  );
}
