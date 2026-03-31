'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';

interface IterationControlsProps {
  content: any;
  onIterationStart?: () => void;
  onIterate: (updated: any) => void;
  onIterationError?: () => void;
  isIterating?: boolean;
}

const SUGGESTIONS = [
  'Make it 3D with physics',
  'Add sound effects',
  'Use more colorful graphics',
  'Include difficulty levels',
  'Add a timer and scoring system',
  'Make the buttons larger',
  'Add celebratory animations',
  'Include hints for struggling students',
];

export default function IterationControls({
  content,
  onIterationStart,
  onIterate,
  onIterationError,
  isIterating = false,
}: IterationControlsProps) {
  const [feedback, setFeedback] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');

  const handleIterate = async () => {
    if (!feedback.trim()) {
      setError('Please provide feedback for improvement');
      return;
    }

    if (feedback.length < 10) {
      setError('Feedback must be at least 10 characters');
      return;
    }

    setError('');

    // Notify parent that iteration is starting
    if (onIterationStart) {
      onIterationStart();
    }

    try {
      const response = await fetch('/api/gemini/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: content?.contentId,
          feedback,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Iteration failed');
        // Reset loading state on error but keep existing content
        if (onIterationError) {
          onIterationError();
        }
        return;
      }

      onIterate(data);
      setFeedback('');
    } catch (err: any) {
      setError(err.message || 'Network error');
      // Reset loading state on network error but keep existing content
      if (onIterationError) {
        onIterationError();
      }
    }
  };

  if (!content) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Refine Your Game</h2>

      {/* Quick Suggestions */}
      <div className="mb-4">
        <p className="text-sm text-ink-600 mb-2">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setFeedback(suggestion)}
              disabled={isIterating}
              className="px-3 py-1 bg-brand-50 text-brand-700 text-sm rounded-lg hover:bg-brand-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Describe improvements
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          disabled={isIterating}
          className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          placeholder="Describe what you'd like to change... (e.g., 'Add sound effects for correct answers', 'Make the graphics more colorful', 'Include a difficulty selector')"
          rows={3}
        />
        <p className="text-sm text-ink-500 mt-1">
          {feedback.length} characters (minimum 10)
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleIterate}
          disabled={!feedback.trim() || isIterating || feedback.length < 10}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            !feedback.trim() || isIterating || feedback.length < 10
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          }`}
        >
          {isIterating ? (
            <span className="flex items-center justify-center">
              <Icon name="loader" className="animate-spin mr-2" />
              Iterating...
            </span>
          ) : (
            <span className="flex items-center justify-center">🔄 Iterate</span>
          )}
        </button>

        <button
          onClick={() => setShowHistory(!showHistory)}
          disabled={isIterating}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:border-brand-500 hover:text-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📜 History
        </button>
      </div>

      {/* Iteration History */}
      {showHistory && (
        <div className="mt-6 border-t pt-6">
          <h3 className="font-semibold mb-3">Iteration History</h3>
          {content.iterationNumber ? (
            <div className="space-y-3">
              {Array.from(
                { length: content.iterationNumber },
                (_, i) => i + 1
              ).map((num) => (
                <div key={num} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Iteration {num}</span>
                    <span className="text-xs text-ink-500">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-ink-600">
                    {num === 1
                      ? 'Initial generation'
                      : content.changesSummary &&
                          num === content.iterationNumber
                        ? content.changesSummary
                        : 'Refinement iteration'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">No iterations yet</p>
          )}
        </div>
      )}

      {/* Iteration Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Be specific in your feedback. Instead of
          "make it better", try "add sound effects when answers are correct" or
          "increase button size to 50px".
        </p>
      </div>
    </div>
  );
}
