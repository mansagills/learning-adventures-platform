'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { siteConfig } from '@/lib/siteConfig';
import { subjects } from '@/lib/content/subjects';
import Container from './Container';
import Button from './Button';
import Icon from './Icon';
import UserMenu from './UserMenu';
import { analytics } from '@/lib/analytics';

const NAV_LINKS = [
  { href: '/games', label: 'Games' },
  { href: '/books', label: 'Books' },
  { href: '/demo', label: 'World Demo' },
  { href: '/about', label: 'About' },
];

const linkClass =
  'text-ink-600 hover:text-brand-500 transition-colors duration-250 font-medium';

const playNowClass =
  'inline-flex items-center justify-center px-5 py-2 font-bold text-white bg-pg-violet rounded-full border-2 border-pg-border shadow-pop transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover focus:outline-none focus:ring-2 focus:ring-pg-violet focus:ring-offset-2';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const subjectsRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, status } = useAuth();
  const accountsEnabled = siteConfig.features.accounts;

  // Close menus when the route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSubjectsOpen(false);
  }, [pathname]);

  // Close the Subjects dropdown on outside click or Escape
  useEffect(() => {
    if (!isSubjectsOpen) return;
    const onClick = (event: MouseEvent) => {
      if (!subjectsRef.current?.contains(event.target as Node)) {
        setIsSubjectsOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsSubjectsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isSubjectsOpen]);

  const handleSignUp = () => {
    window.location.href = '/login?mode=signup';
    analytics.clickCTA('Header CTA', 'header');
  };

  const handleSignIn = () => {
    window.location.href = '/login?mode=signin';
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

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
          <nav
            className="hidden md:flex items-center space-x-6 lg:space-x-8"
            aria-label="Main"
          >
            <Link
              href={NAV_LINKS[0].href}
              className={linkClass}
              aria-current={isActive(NAV_LINKS[0].href) ? 'page' : undefined}
            >
              {NAV_LINKS[0].label}
            </Link>

            <div className="relative" ref={subjectsRef}>
              <button
                type="button"
                onClick={() => setIsSubjectsOpen((open) => !open)}
                className={`${linkClass} inline-flex items-center gap-1`}
                aria-expanded={isSubjectsOpen}
                aria-haspopup="true"
              >
                Subjects
                <ChevronDown
                  size={16}
                  className={`transition-transform ${isSubjectsOpen ? 'rotate-180' : ''}`}
                  aria-hidden
                />
              </button>
              {isSubjectsOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 bg-white rounded-2xl border-2 border-pg-border shadow-pop p-2">
                  {subjects.map((subject) => (
                    <Link
                      key={subject.id}
                      href={`/subjects/${subject.id}`}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-brand-50 transition-colors"
                    >
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${subject.theme.soft}`}
                        aria-hidden
                      >
                        {subject.emoji}
                      </span>
                      <span>
                        <span className="block font-semibold text-ink-800">
                          {subject.name}
                        </span>
                        <span className="block text-xs text-ink-500">
                          {subject.tagline}
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {NAV_LINKS.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={linkClass}
                aria-current={isActive(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {!accountsEnabled ? (
              <Link href="/games" className={playNowClass}>
                Play Now
              </Link>
            ) : status === 'loading' ? (
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
                <UserMenu />
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button onClick={handleSignIn} className={linkClass}>
                  Sign In
                </button>
                <Button
                  onClick={handleSignUp}
                  data-analytics="header-cta-sign-up"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen((open) => !open)}
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
            <nav className="flex flex-col space-y-1" aria-label="Main">
              <Link href="/games" className={`${linkClass} py-2`}>
                Games
              </Link>

              <p className="pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-ink-400">
                Subjects
              </p>
              <div className="grid grid-cols-2 gap-2 pb-2">
                {subjects.map((subject) => (
                  <Link
                    key={subject.id}
                    href={`/subjects/${subject.id}`}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 font-medium text-ink-700 ${subject.theme.soft}`}
                  >
                    <span aria-hidden>{subject.emoji}</span>
                    {subject.name}
                  </Link>
                ))}
              </div>

              {NAV_LINKS.slice(1).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${linkClass} py-2`}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-4">
                {!accountsEnabled ? (
                  <Link href="/games" className={`${playNowClass} w-full`}>
                    Play Now
                  </Link>
                ) : user ? (
                  <div className="space-y-3">
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/internal"
                        className="flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium"
                      >
                        <Icon name="settings" size={18} />
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="flex justify-center">
                      <UserMenu />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleSignIn}
                      className={`w-full py-2 ${linkClass}`}
                    >
                      Sign In
                    </button>
                    <Button
                      onClick={handleSignUp}
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
