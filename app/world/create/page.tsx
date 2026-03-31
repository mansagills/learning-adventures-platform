'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CharacterCreator } from '@/components/world/CharacterCreator';

/**
 * Character Creation Page
 * Entry point for creating a new character before entering the 2D world
 */
export default function CreateCharacterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkExistingCharacter = async () => {
      if (status === 'unauthenticated') {
        router.push('/');
        return;
      }

      if (status === 'authenticated') {
        try {
          // Check if user already has a character
          const response = await fetch('/api/character');
          const data = await response.json();

          if (data.character) {
            // Character exists - redirect to world
            router.push('/world');
          } else {
            // No character - show creator
            setIsChecking(false);
          }
        } catch (error) {
          console.error('Error checking character:', error);
          setIsChecking(false);
        }
      }
    };

    checkExistingCharacter();
  }, [status, router]);

  // Show loading while checking auth/character
  if (status === 'loading' || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]" />
          <p className="mt-4 text-lg text-[#8B5CF6] font-semibold">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return <CharacterCreator onComplete={() => {}} />;
}
