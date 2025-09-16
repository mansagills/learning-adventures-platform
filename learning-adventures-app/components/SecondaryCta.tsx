'use client';

import Container from './Container';
import Button from './Button';
import { analytics } from '@/lib/analytics';

export default function SecondaryCta() {
  const handlePrimaryCTA = () => {
    analytics.clickCTA('Start Your Adventure', 'secondary-cta');
  };

  const handleSecondaryCTA = () => {
    analytics.clickCTA('Explore the Adventure Catalog', 'secondary-cta');
  };

  return (
    <section className="py-16 bg-gradient-to-r from-brand-500 to-accent-500">
      <Container>
        <div className="text-center text-white">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Child's Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
            Join thousands of families who have discovered the joy of learning through our interactive educational platform. Start your free trial today!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={handlePrimaryCTA}
              data-analytics="secondary-cta-start-adventure"
              className="bg-white text-brand-500 hover:bg-gray-50"
            >
              Start Your Adventure
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleSecondaryCTA}
              data-analytics="secondary-cta-explore-catalog"
              className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-brand-500"
            >
              Explore the Adventure Catalog
            </Button>
          </div>

          <div className="mt-8 text-sm opacity-75">
            ✓ Free 14-day trial • ✓ No credit card required • ✓ Cancel anytime
          </div>
        </div>
      </Container>
    </section>
  );
}