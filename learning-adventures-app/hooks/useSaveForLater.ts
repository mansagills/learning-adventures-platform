'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SavedAdventure {
  adventureId: string;
  savedAt: Date;
}

export function useSaveForLater() {
  const { data: session } = useSession();
  const [savedAdventures, setSavedAdventures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved adventures from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storageKey = session?.user?.email
      ? `savedAdventures_${session.user.email}`
      : 'savedAdventures_guest';

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedAdventures(parsed.map((item: SavedAdventure) => item.adventureId));
      } catch (error) {
        console.error('Error loading saved adventures:', error);
      }
    }
    setIsLoading(false);
  }, [session?.user?.email]);

  const saveAdventure = (adventureId: string) => {
    if (savedAdventures.includes(adventureId)) return;

    const storageKey = session?.user?.email
      ? `savedAdventures_${session.user.email}`
      : 'savedAdventures_guest';

    const newSaved = [...savedAdventures, adventureId];
    setSavedAdventures(newSaved);

    // Save to localStorage with metadata
    const savedData: SavedAdventure[] = newSaved.map(id => ({
      adventureId: id,
      savedAt: new Date()
    }));

    localStorage.setItem(storageKey, JSON.stringify(savedData));

    // TODO: If user is authenticated, also save to database
    if (session?.user) {
      // Future: POST /api/saved-adventures
    }
  };

  const unsaveAdventure = (adventureId: string) => {
    const storageKey = session?.user?.email
      ? `savedAdventures_${session.user.email}`
      : 'savedAdventures_guest';

    const newSaved = savedAdventures.filter(id => id !== adventureId);
    setSavedAdventures(newSaved);

    // Update localStorage
    const savedData: SavedAdventure[] = newSaved.map(id => ({
      adventureId: id,
      savedAt: new Date()
    }));

    localStorage.setItem(storageKey, JSON.stringify(savedData));

    // TODO: If user is authenticated, also remove from database
    if (session?.user) {
      // Future: DELETE /api/saved-adventures/:id
    }
  };

  const toggleSave = (adventureId: string) => {
    if (isSaved(adventureId)) {
      unsaveAdventure(adventureId);
    } else {
      saveAdventure(adventureId);
    }
  };

  const isSaved = (adventureId: string) => {
    return savedAdventures.includes(adventureId);
  };

  const getSavedCount = () => {
    return savedAdventures.length;
  };

  return {
    savedAdventures,
    saveAdventure,
    unsaveAdventure,
    toggleSave,
    isSaved,
    getSavedCount,
    isLoading
  };
}
