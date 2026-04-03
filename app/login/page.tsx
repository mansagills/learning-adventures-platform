'use client';

import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginPageContent from '@/components/LoginPageContent';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const callbackUrl = searchParams.get('callbackUrl') ?? undefined;

  // If already authenticated, redirect away
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') return null;
  if (session) return null;

  return <LoginPageContent defaultMode={mode} callbackUrl={callbackUrl} />;
}
