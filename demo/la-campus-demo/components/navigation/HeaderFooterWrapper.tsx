'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AUTH_ROUTES = ['/login'];

/**
 * Routes that own the whole viewport and must not be framed by the marketing
 * site chrome. The campus is a full-screen Phaser canvas sized to `h-screen`:
 * with the header above and the footer below, the page ran ~1210px tall, so
 * the "immersive" world opened as a letterboxed panel under a nav bar with a
 * marketing footer under it, and the page scrolled.
 */
const IMMERSIVE_ROUTE_PREFIXES = ['/world', '/dev/campus-sandbox'];

function hidesSiteChrome(pathname: string): boolean {
  return (
    AUTH_ROUTES.some((route) => pathname === route) ||
    IMMERSIVE_ROUTE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

export default function HeaderFooterWrapper() {
  const pathname = usePathname();
  if (hidesSiteChrome(pathname)) return null;

  return (
    <>
      <Header />
    </>
  );
}

export function FooterWrapper() {
  const pathname = usePathname();
  if (hidesSiteChrome(pathname)) return null;

  return <Footer />;
}
