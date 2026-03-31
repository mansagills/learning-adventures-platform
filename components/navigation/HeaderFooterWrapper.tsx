'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const AUTH_ROUTES = ['/login'];

export default function HeaderFooterWrapper() {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute) return null;

  return (
    <>
      <Header />
    </>
  );
}

export function FooterWrapper() {
  const pathname = usePathname();
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isAuthRoute) return null;

  return <Footer />;
}
