import Hero from '@/components/Hero';
import ContinueLearningSection from '@/components/preview/ContinueLearningSection';
import AdventurePreviewGrid from '@/components/preview/AdventurePreviewGrid';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import SocialProof from '@/components/SocialProof';
import SecondaryCta from '@/components/SecondaryCta';
import Faq from '@/components/Faq';

export default function HomePage() {
  return (
    <>
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