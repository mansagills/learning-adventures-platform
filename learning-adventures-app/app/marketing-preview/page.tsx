/**
 * Marketing Preview Page
 *
 * This page shows the marketing content locally during development.
 * In production, unauthenticated users will be redirected to the Webflow marketing site.
 *
 * This is just for previewing - the actual marketing site will be built in Webflow.
 */

import Hero from '@/components/Hero';
import ContinueLearningSection from '@/components/preview/ContinueLearningSection';
import AdventurePreviewGrid from '@/components/preview/AdventurePreviewGrid';
import Benefits from '@/components/Benefits';
import HowItWorks from '@/components/HowItWorks';
import SocialProof from '@/components/SocialProof';
import SecondaryCta from '@/components/SecondaryCta';
import Faq from '@/components/Faq';

export default function MarketingPreviewPage() {
  return (
    <>
      {/* Development Notice Banner */}
      <div className="bg-yellow-50 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-sm text-yellow-800 text-center">
            📋 <strong>Marketing Preview Mode</strong> - This content will be hosted on Webflow at learningadventures.org in production
          </p>
        </div>
      </div>

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
