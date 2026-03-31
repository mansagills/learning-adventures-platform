import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LoginPageContent from '@/components/LoginPageContent';


interface LoginPageProps {
  searchParams: Promise<{ mode?: string; callbackUrl?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const mode = params.mode === 'signup' ? 'signup' : 'signin';
  const callbackUrl = params.callbackUrl;

  return <LoginPageContent defaultMode={mode} callbackUrl={callbackUrl} />;
}
