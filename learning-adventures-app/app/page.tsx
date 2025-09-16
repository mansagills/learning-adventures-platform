import Hero from '@/components/Hero';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import SocialProof from '@/components/SocialProof';
import SecondaryCta from '@/components/SecondaryCta';
import Faq from '@/components/Faq';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Benefits />
      <HowItWorks />
      <SocialProof />
      <SecondaryCta />
      <Faq />
    </>
  );
}