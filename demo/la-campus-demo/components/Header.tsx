'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Container from './Container';
import Button from './Button';
import Icon from './Icon';
import UserMenu from './UserMenu';
import { analytics } from '@/lib/analytics';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, status } = useAuth();

  const handleCTAClick = () => {
    if (user) {
      window.location.href = '/world';
    } else {
      window.location.href = '/login?mode=signup';
    }
    analytics.clickCTA('Header CTA', 'header');
  };

  const handleSignIn = () => {
    window.location.href = '/login?mode=signin';
  };

  const handleSignUp = () => {
    window.location.href = '/login?mode=signup';
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
            {user &&
              (user.role === 'PARENT' ||
                user.role === 'TEACHER' ||
                user.role === 'ADMIN') && (
                <Link
                  href="/course-request"
                  className="text-ink-600 hover:text-brand-500 transition-colors duration-250 font-medium"
                >
                  Request Custom Course
                </Link>
              )}
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
            ) : user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'ADMIN' && (
                  <Link
                    href="/internal"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-purple-600 transition-all"
                  >
                    <Icon name="settings" size={16} />
                    Admin
                  </Link>
                )}
                <Link
                  href="/world"
                  className="text-ink-600 hover:text-brand-500 transition-colors duration-250 font-medium"
                >
                  Play Campus
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
                {user ? (
                  <div className="space-y-3">
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/internal"
                        className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Icon name="settings" size={18} />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/world"
                      className="block text-center py-2 text-brand-500 font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Play Campus
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

    </header>
  );
}
