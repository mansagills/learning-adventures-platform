'use client';

import Image from 'next/image';
import Container from './Container';
import Button from './Button';
import TrustBadges from './TrustBadges';
import { analytics } from '@/lib/analytics';

export default function Hero() {
  const handlePrimaryCTA = () => {
    analytics.clickCTA('Start Your Adventure', 'hero');
  };

  const handleSecondaryCTA = () => {
    analytics.clickCTA('Explore the Adventure Catalog', 'hero');
  };

  return (
    <section className="relative bg-gradient-to-br from-brand-100 via-purple-50 to-accent-100 pt-16 pb-20 overflow-hidden">
      {/* Fun background decorations */}
      <div className="absolute inset-0 bg-dots opacity-30"></div>
      <div className="absolute top-20 right-10 w-32 h-32 bg-sunshine-300 shape-blob opacity-20 animate-float"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-coral-300 shape-blob-2 opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-ocean-300 rounded-full opacity-20 animate-pulse-slow"></div>

      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Fun badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white rounded-full shadow-lg animate-bounce-in">
              <span className="text-2xl">🚀</span>
              <span className="text-sm font-bold text-brand-600">Adventure Awaits!</span>
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-ink-900 mb-6 text-balance leading-tight">
              Transform Learning Into an{' '}
              <span className="gradient-text-fun animate-shimmer" style={{ backgroundSize: '200% auto' }}>Adventure!</span>
            </h1>

            <p className="text-xl md:text-2xl text-ink-700 mb-8 leading-relaxed font-medium">
              🎮 Interactive games, 🧪 fun experiments, and 📚 exciting lessons designed for kids who love to learn!
            </p>

            {/* Trust Badges */}
            <div className="mb-8">
              <TrustBadges />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={handlePrimaryCTA}
                data-analytics="hero-primary-cta"
                className="bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-fun hover:shadow-fun-lg transform hover:scale-105 transition-all duration-300 text-lg font-bold animate-bounce-in"
              >
                🎉 Start Your Adventure
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={handleSecondaryCTA}
                data-analytics="hero-secondary-cta"
                className="bg-white hover:bg-gradient-to-r hover:from-accent-50 hover:to-brand-50 border-2 border-brand-400 text-brand-600 font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 animate-bounce-in"
                style={{ animationDelay: '100ms' }}
              >
                🔍 Explore Adventures
              </Button>
            </div>

            {/* Social Proof Stats */}
            <div className="mt-12 grid grid-cols-3 gap-4 text-center lg:text-left">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl md:text-4xl font-bold gradient-text-rainbow">50K+</div>
                <div className="text-xs md:text-sm text-ink-600 font-medium mt-1">🎊 Happy Families</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl md:text-4xl font-bold gradient-text-rainbow">95%</div>
                <div className="text-xs md:text-sm text-ink-600 font-medium mt-1">⭐ Success Rate</div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-3xl md:text-4xl font-bold gradient-text-rainbow">200+</div>
                <div className="text-xs md:text-sm text-ink-600 font-medium mt-1">🚀 Adventures</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            {/* Decorative background elements */}
            <div className="absolute -inset-6 bg-gradient-to-br from-brand-400/30 via-coral-400/30 to-sunshine-400/30 rounded-3xl blur-2xl opacity-60"></div>

            <div className="relative z-10 card-fun overflow-hidden">
              <Image
                src="/hero-image.jpg"
                alt="Children engaged in interactive learning with tablets and educational games"
                width={600}
                height={400}
                className="rounded-3xl"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+15/8Aej7vzLKrVagZ2lVzsWOlgDgR+2eKCY7aM+QhVsHc8DP0CXNN+u9jEK4YQDJgppvOeGkTq4GawX4mS5mI+CxvGN7wL8A/rGlTxKbR2Cv20F3d/ePn5t+kCCNhGQJKckb+C35L1rYCvK6z6KKKUFvSgaBebB3BSE+3vFRt5Tk1+VzKmWkM55BG4aJJkIznJX2oUhU6lLdPKvz2Zt5N5t7VKm5VQG/k/9k="
              />
            </div>

            {/* Fun floating decorative elements */}
            <div className="absolute -top-8 -right-8 w-20 h-20 bg-sunshine-400 rounded-2xl rotate-12 opacity-80 shadow-lg animate-float">
              <div className="w-full h-full flex items-center justify-center text-3xl">⭐</div>
            </div>
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-coral-400 shape-blob opacity-70 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
              <div className="w-full h-full flex items-center justify-center text-4xl">🎯</div>
            </div>
            <div className="absolute top-1/2 -right-10 w-16 h-16 bg-ocean-400 rounded-full opacity-80 shadow-lg animate-float" style={{ animationDelay: '2s' }}>
              <div className="w-full h-full flex items-center justify-center text-2xl">🚀</div>
            </div>
            <div className="absolute top-10 -left-8 w-14 h-14 bg-grass-400 rounded-xl rotate-45 opacity-70 shadow-lg animate-float" style={{ animationDelay: '1.5s' }}>
              <div className="w-full h-full flex items-center justify-center -rotate-45 text-2xl">🎓</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}