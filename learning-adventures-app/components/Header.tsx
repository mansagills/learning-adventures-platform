'use client';

import { useState } from 'react';
import Link from 'next/link';
import Container from './Container';
import Button from './Button';
import Icon from './Icon';
import { analytics } from '@/lib/analytics';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCTAClick = () => {
    analytics.clickCTA('Header CTA', 'header');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <Container>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 font-display font-bold text-xl text-brand-500"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Icon name="academic" size={20} className="text-white" />
            </div>
            <span>Learning Adventures</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#benefits"
              className="text-ink-600 hover:text-brand-500 transition-colors duration-250"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-ink-600 hover:text-brand-500 transition-colors duration-250"
            >
              How It Works
            </Link>
            <Link
              href="#social-proof"
              className="text-ink-600 hover:text-brand-500 transition-colors duration-250"
            >
              Reviews
            </Link>
            <Link
              href="#faq"
              className="text-ink-600 hover:text-brand-500 transition-colors duration-250"
            >
              FAQ
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={handleCTAClick}
              data-analytics="header-cta-start-adventure"
            >
              Start Your Adventure
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 text-ink-600 hover:text-brand-500 transition-colors duration-250"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <Icon name={isMenuOpen ? 'close' : 'menu'} size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <Link
                href="#benefits"
                className="text-ink-600 hover:text-brand-500 transition-colors duration-250 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-ink-600 hover:text-brand-500 transition-colors duration-250 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="#social-proof"
                className="text-ink-600 hover:text-brand-500 transition-colors duration-250 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Reviews
              </Link>
              <Link
                href="#faq"
                className="text-ink-600 hover:text-brand-500 transition-colors duration-250 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <div className="pt-4">
                <Button
                  onClick={handleCTAClick}
                  className="w-full"
                  data-analytics="mobile-header-cta-start-adventure"
                >
                  Start Your Adventure
                </Button>
              </div>
            </nav>
          </div>
        )}
      </Container>
    </header>
  );
}