/**
 * LandingPage Component
 *
 * The marketing landing page for learningadventures.org
 * Shows the full marketing content with optional personalization for authenticated users.
 */

import Hero from '@/components/Hero';
import ContinueLearningSection from '@/components/preview/ContinueLearningSection';
import AdventurePreviewGrid from '@/components/preview/AdventurePreviewGrid';
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
      {/* Welcome back banner for authenticated users */}
      {isAuthenticated && <WelcomeBackBanner userName={userName} />}

      <Hero />
      <ContinueLearningSection />
      <AdventurePreviewGrid />
      <Benefits />
      <HowItWorks />
      <SocialProof />
      <SecondaryCta />
      <Faq />
    </>
  );
}
