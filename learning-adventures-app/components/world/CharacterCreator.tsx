'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Avatar options — sprite sheets live in /game-assets/sprites/
// Preview uses the first frame (idle-down) clipped via CSS object-fit
const AVATAR_OPTIONS = [
  {
    id: 'human-1',
    name: 'Student',
    spritePath: '/game-assets/sprites/human-1.png',
  },
  {
    id: 'human-2',
    name: 'Student 2',
    spritePath: '/game-assets/sprites/human-2.png',
  },
  {
    id: 'robot-blue',
    name: 'Robot',
    spritePath: '/game-assets/sprites/robot-blue.png',
  },
  {
    id: 'wizard-purple',
    name: 'Wizard',
    spritePath: '/game-assets/sprites/wizard-purple.png',
  },
  {
    id: 'cat-orange',
    name: 'Cat',
    spritePath: '/game-assets/sprites/cat-orange.png',
  },
  {
    id: 'knight-silver',
    name: 'Knight',
    spritePath: '/game-assets/sprites/knight-silver.png',
  },
];

interface CharacterCreatorProps {
  onComplete: () => void;
}

export function CharacterCreator({ onComplete }: CharacterCreatorProps) {
  const router = useRouter();
  const [step, setStep] = useState<'name' | 'avatar'>('name');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2 && name.trim().length <= 20) {
      setStep('avatar');
      setError(null);
    } else {
      setError('Name must be between 2 and 20 characters');
    }
  };

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setError(null);
  };

  const handleCreateCharacter = async () => {
    if (!selectedAvatar || !name.trim()) {
      setError('Please complete all steps');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/character/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          avatarId: selectedAvatar,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create character');
      }

      // Success! Navigate to world
      onComplete();
      router.push('/world');
    } catch (err) {
      console.error('Error creating character:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to create character'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFFDF5] to-[#F5F5DC] p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#8B5CF6] mb-2">
            Create Your Character
          </h1>
          <p className="text-gray-600">
            {step === 'name'
              ? 'Choose a name for your character'
              : 'Select your avatar'}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8 gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === 'name'
                ? 'bg-[#8B5CF6] text-white'
                : 'bg-green-500 text-white'
            }`}
          >
            {step === 'name' ? '1' : '✓'}
          </div>
          <div className="w-16 h-1 bg-gray-300">
            <div
              className={`h-full bg-[#8B5CF6] transition-all duration-300 ${
                step === 'avatar' ? 'w-full' : 'w-0'
              }`}
            />
          </div>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step === 'avatar'
                ? 'bg-[#8B5CF6] text-white'
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            2
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Step 1: Name Input */}
        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="character-name"
                className="block text-lg font-semibold text-gray-700 mb-2"
              >
                Character Name
              </label>
              <input
                type="text"
                id="character-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your character's name"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-[#8B5CF6] focus:outline-none"
                maxLength={20}
                autoFocus
              />
              <p className="mt-2 text-sm text-gray-500">
                {name.length}/20 characters
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#8B5CF6] text-white font-semibold rounded-lg hover:bg-[#7C3AED] transition-colors text-lg"
            >
              Next: Choose Avatar
            </button>
          </form>
        )}

        {/* Step 2: Avatar Selection */}
        {step === 'avatar' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => handleAvatarSelect(avatar.id)}
                  className={`p-2 rounded-lg border-2 transition-all ${
                    selectedAvatar === avatar.id
                      ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 scale-105'
                      : 'border-gray-300 hover:border-[#8B5CF6] hover:scale-105'
                  }`}
                >
                  {/* Sprite preview — show first frame (top-left 96x96 of 384x384 sheet) */}
                  <div className="w-full aspect-square overflow-hidden rounded mb-1 bg-[#FFFDF5]">
                    <img
                      src={avatar.spritePath}
                      alt={avatar.name}
                      style={{
                        width: '400%', // 384px sheet shown in ~96px container = 4x zoom
                        imageRendering: 'pixelated',
                        transform: 'translate(0, 0)',
                      }}
                    />
                  </div>
                  <p className="text-xs text-center font-medium text-gray-700">
                    {avatar.name}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep('name')}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCreateCharacter}
                disabled={!selectedAvatar || isSubmitting}
                className="flex-1 py-3 bg-[#8B5CF6] text-white font-semibold rounded-lg hover:bg-[#7C3AED] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Creating...
                  </span>
                ) : (
                  'Create Character'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
