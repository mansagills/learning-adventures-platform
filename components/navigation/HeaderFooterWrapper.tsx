'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Routes that render full screen, without the site header and footer
const CHROMELESS_ROUTES = ['/login', '/demo/play', '/dev/campus-sandbox'];

export default function HeaderFooterWrapper() {
  const pathname = usePathname();
  const isChromeless = CHROMELESS_ROUTES.some((route) => pathname === route);

  if (isChromeless) return null;

  return (
    <>
      <Header />
    </>
  );
}

export function FooterWrapper() {
  const pathname = usePathname();
  const isChromeless = CHROMELESS_ROUTES.some((route) => pathname === route);

  if (isChromeless) return null;

  return <Footer />;
}
