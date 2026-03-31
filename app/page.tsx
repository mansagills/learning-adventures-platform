import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import LandingPage from '@/components/LandingPage';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <LandingPage
      isAuthenticated={!!session?.user}
      userName={session?.user?.name}
    />
  );
}
