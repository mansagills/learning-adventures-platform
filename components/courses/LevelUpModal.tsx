/**
 * LevelUpModal Component
 *
 * Celebration modal when user levels up.
 */

'use client';

interface LevelUpModalProps {
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const levelBadges: Record<number, string> = {
    1: '🎓',
    5: '🌟',
    10: '⭐',
    20: '💎',
    30: '🏆',
    40: '👑',
  };

  const getBadge = () => {
    const thresholds = Object.keys(levelBadges)
      .map(Number)
      .sort((a, b) => b - a);

    for (const threshold of thresholds) {
      if (level >= threshold) {
        return levelBadges[threshold];
      }
    }
    return '🎓';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center animate-scale-up">
        {/* Badge */}
        <div className="text-8xl mb-4 animate-bounce">{getBadge()}</div>

        {/* Level */}
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          Level {level}!
        </h2>

        {/* Message */}
        <p className="text-gray-600 mb-6">
          Congratulations! You've leveled up and unlocked new achievements!
        </p>

        {/* Confetti effect */}
        <div className="text-6xl mb-6">🎉 🎊 ✨</div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue Learning
        </button>
      </div>

      <style jsx>{`
        @keyframes scale-up {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-up {
          animation: scale-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
