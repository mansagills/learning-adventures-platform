'use client';

import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import SocialProof from '@/components/SocialProof';
import SecondaryCta from '@/components/SecondaryCta';
import Faq from '@/components/Faq';
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
