'use client';

import Hero from './Hero';
import Benefits from './Benefits';
import HowItWorks from './HowItWorks';
import SocialProof from './SocialProof';
import SecondaryCta from './SecondaryCta';
import Faq from './Faq';
import WelcomeBackBanner from '@/components/WelcomeBackBanner';
import { useAuth } from '@/hooks/useAuth';
import { siteConfig } from '@/lib/siteConfig';

export default function LandingPage() {
  const { user } = useAuth();
  return (
    <>
      {siteConfig.features.accounts && user && (
        <WelcomeBackBanner userName={user.name} />
      )}
      <Hero />
      <HowItWorks />
      <Benefits />
      <SocialProof />
      <SecondaryCta />
      <Faq />
    </>
  );
}
