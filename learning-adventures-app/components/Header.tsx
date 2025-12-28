'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Container from './Container';
import Button from './Button';
import Icon from './Icon';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';
import { analytics } from '@/lib/analytics';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authCallbackUrl, setAuthCallbackUrl] = useState<string>('/');
  const { data: session, status } = useSession();

  const handleCTAClick = () => {
    if (session) {
      // If user is logged in, navigate to dashboard
      window.location.href = '/dashboard';
    } else {
      // If not logged in, open signup modal
      setAuthMode('signup');
      setAuthCallbackUrl('/');
      setIsAuthModalOpen(true);
    }
    analytics.clickCTA('Header CTA', 'header');
  };

  const handleSignIn = (callbackUrl: string = '/') => {
    setAuthMode('signin');
    setAuthCallbackUrl(callbackUrl);
    setIsAuthModalOpen(true);
  };

  const handleSignUp = (callbackUrl: string = '/') => {
    setAuthMode('signup');
    setAuthCallbackUrl(callbackUrl);
    setIsAuthModalOpen(true);
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
              href="/catalog"
              className="text-ink-600 hover:text-brand-500 transition-colors duration-250 font-medium"
            >
              Adventure Catalog
            </Link>
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
            {status === 'loading' ? (
              <div className="animate-pulse">
                <div className="h-10 w-24 bg-gray-200 rounded-lg"></div>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <Link
                  href="/dashboard"
                  className="text-ink-600 hover:text-brand-500 transition-colors duration-250 font-medium"
                >
                  Dashboard
                </Link>
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleSignIn()}
                  className="text-ink-600 hover:text-brand-500 transition-colors duration-250 font-medium"
                >
                  Sign In
                </button>
                <Button
                  onClick={() => handleSignUp()}
                  data-analytics="header-cta-sign-up"
                >
                  Sign Up
                </Button>
              </div>
            )}
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
                href="/catalog"
                className="text-ink-600 hover:text-brand-500 transition-colors duration-250 py-2 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Adventure Catalog
              </Link>
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
                {session ? (
                  <div className="space-y-3">
                    <Link
                      href="/dashboard"
                      className="block text-center py-2 text-brand-500 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <div className="flex justify-center">
                      <UserMenu />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignIn();
                      }}
                      className="w-full text-ink-600 hover:text-brand-500 transition-colors duration-250 py-2 font-medium"
                    >
                      Sign In
                    </button>
                    <Button
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignUp();
                      }}
                      className="w-full"
                      data-analytics="mobile-header-cta-sign-up"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </Container>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
        callbackUrl={authCallbackUrl}
      />
    </header>
  );
}