'use client';

import { useState, useEffect } from 'react';

interface JaylenGuideProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Learning Adventures!',
    message:
      "Hey! I'm Jaylen, your campus guide. This is Learning Adventures — a whole campus built just for you. Let me show you around real quick!",
    highlight: null,
    action: 'Next',
  },
  {
    id: 'controls',
    title: 'Moving Around',
    message:
      'Use your WASD keys or the Arrow Keys on your keyboard to walk around campus. Try moving around right now — go ahead, I\'ll wait!',
    highlight: 'controls-hint',
    action: 'Got it!',
  },
  {
    id: 'buildings',
    title: 'Explore the Buildings',
    message:
      'See those buildings around you? Each one is packed with games and challenges. Walk up to a door and press SPACE to go inside. The Math Building is fully open — start there!',
    highlight: null,
    action: 'Cool!',
  },
  {
    id: 'quests',
    title: 'Your Quest Log',
    message:
      "Tap the 📋 Quest button to see your missions. Complete quests to earn XP and level up. Your teachers will give you quests when you talk to them inside each building.",
    highlight: null,
    action: 'Got it!',
  },
  {
    id: 'xp',
    title: 'XP & Rewards',
    message:
      "Every game you play, every quest you finish — you earn XP and coins. Use coins at the Campus Shop to deck out your character. Keep your streak going for bonus XP every day!",
    highlight: 'xp-display',
    action: "Let's go!",
  },
  {
    id: 'spark',
    title: 'Meet SPARK',
    message:
      "One more thing — see that ⚡ button in the corner? That's SPARK, your AI study buddy. Got a question about anything? Just ask SPARK. Alright, campus is all yours. Have fun!",
    highlight: 'spark-button',
    action: 'Start Exploring!',
  },
];

export function JaylenGuide({ onComplete }: JaylenGuideProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setStepIndex((i) => i + 1);
    }
  };

  const handleComplete = async () => {
    setIsExiting(true);
    try {
      await fetch('/api/onboarding/complete', { method: 'POST' });
    } catch {
      // Non-blocking — onboarding still visually completes
    }
    setTimeout(onComplete, 400);
  };

  // Highlight matching HUD element by id
  useEffect(() => {
    if (!step.highlight) return;
    const el = document.getElementById(step.highlight);
    if (el) {
      el.classList.add('ring-4', 'ring-yellow-400', 'ring-offset-2', 'z-50');
      return () => el.classList.remove('ring-4', 'ring-yellow-400', 'ring-offset-2', 'z-50');
    }
  }, [step.highlight]);

  return (
    <div
      className={`absolute inset-0 z-50 flex items-end justify-center pb-16 pointer-events-none transition-opacity duration-400 ${isExiting ? 'opacity-0' : 'opacity-100'}`}
    >
      {/* Dark vignette at bottom to help card pop */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* Guide card */}
      <div className="relative pointer-events-auto max-w-lg w-full mx-4 bg-white rounded-2xl shadow-2xl border-4 border-[#8B5CF6] overflow-hidden">
        {/* Jaylen portrait header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 bg-[#8B5CF6]">
          <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl shadow-md flex-shrink-0">
            🧑🏾‍🎓
          </div>
          <div>
            <p className="text-white font-bold text-sm">Jaylen</p>
            <p className="text-purple-200 text-xs">Your Campus Guide</p>
          </div>
          {/* Step counter */}
          <div className="ml-auto flex gap-1">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${i === stepIndex ? 'bg-yellow-400' : 'bg-purple-400'}`}
              />
            ))}
          </div>
        </div>

        {/* Message body */}
        <div className="px-5 py-4">
          <h3 className="font-bold text-[#1F1F2E] text-base mb-1">{step.title}</h3>
          <p className="text-gray-700 text-sm leading-relaxed">{step.message}</p>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-4 flex justify-between items-center">
          <button
            onClick={handleComplete}
            className="text-gray-400 text-xs hover:text-gray-600 transition-colors"
          >
            Skip tour
          </button>
          <button
            onClick={handleNext}
            className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-6 py-2 rounded-xl transition-colors text-sm"
          >
            {step.action}
          </button>
        </div>
      </div>
    </div>
  );
}
