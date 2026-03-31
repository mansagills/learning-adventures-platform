/**
 * XPReward Component
 *
 * Animated XP reward notification.
 */

'use client';

import { useEffect, useState } from 'react';

interface XPRewardProps {
  xp: number;
  onComplete?: () => void;
}

export default function XPReward({ xp, onComplete }: XPRewardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show animation
    setVisible(true);

    // Hide after 2 seconds
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300); // Wait for fade out
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [xp, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="animate-bounce">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-full shadow-2xl text-2xl font-bold">
          +{xp} XP ⭐
        </div>
      </div>
    </div>
  );
}
