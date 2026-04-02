/**
 * LandingPage Component
 *
 * The marketing landing page for learningadventures.org
 * Showcases the 2D pixel world experience — explore, quest, level up.
 */

import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import SocialProof from '@/components/SocialProof';
import SecondaryCta from '@/components/SecondaryCta';
import Faq from '@/components/Faq';
import WelcomeBackBanner from '@/components/WelcomeBackBanner';

interface LandingPageProps {
  isAuthenticated?: boolean;
  userName?: string | null;
}

export default function LandingPage({
  isAuthenticated,
  userName,
}: LandingPageProps) {
  return (
    <>
      {isAuthenticated && <WelcomeBackBanner userName={userName} />}
      <Hero />
      <HowItWorks />
      <Benefits />
      <SocialProof />
      <SecondaryCta />
      <Faq />
    </>
  );
}
