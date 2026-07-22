'use client';

import { useEffect } from 'react';
import { initializeGameRegistry } from '@/lib/gameLoader';

export default function GameRegistryInitializer() {
  useEffect(() => {
    initializeGameRegistry().catch(console.warn);
  }, []);

  return null; // This component doesn't render anything
}
