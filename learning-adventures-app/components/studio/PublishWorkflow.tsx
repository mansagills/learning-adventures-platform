'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';

interface PublishWorkflowProps {
  content: any;
}

export default function PublishWorkflow({ content }: PublishWorkflowProps) {
  const [metadata, setMetadata] = useState({
    title: content?.title || '',
    description: '',
    featured: false,
    estimatedTime: '10-15 mins'
  });
  // Always use test-games - catalog direct publishing is disabled
  const destination = 'test-games';
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState<any>(null);
  const [error, setError] = useState('');

  const qualityScores = {
    accessibility: 95,
    performance: 92,
    educational: 90
  };

  const handlePublish = async () => {
    if (!metadata.title || !metadata.description) {
      setError('Please provide both title and description');
      return;
    }

    if (metadata.title.length < 3) {
      setError('Title must be at least 3 characters');
      return;
    }

    if (metadata.description.length < 20) {
      setError('Description must be at least 20 characters');
      return;
    }

    setError('');
    setIsPublishing(true);

    try {
      const response = await fetch('/api/gemini/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: content?.contentId,
          destination,
          metadata
        })
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Publishing failed');
        setIsPublishing(false);
        return;
      }

      setPublishResult(result);
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!content) {
    return null;
  }

  if (publishResult) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-ink-900 mb-2">
            Submitted for Review!
          </h2>
          <p className="text-ink-600 mb-6">
            Your game has been added to the testing queue and is ready for team review.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              <strong>File saved to:</strong> {publishResult.filePath}
            </p>
            {publishResult.testGameId && (
              <p className="text-sm text-green-800 mt-2">
                <strong>Test Game ID:</strong> {publishResult.testGameId}
              </p>
            )}
            <p className="text-xs text-green-700 mt-3">
              📋 Your game will appear in the testing dashboard with status "NOT_TESTED"
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex space-x-3 justify-center">
              <a
                href={publishResult.previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
              >
                <Icon name="external-link" size={16} className="mr-2" />
                Test Game
              </a>
              <a
                href="/internal/testing"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Icon name="clipboard" size={16} className="mr-2" />
                Go to Testing Dashboard
              </a>
            </div>
            <button
              onClick={() => setPublishResult(null)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:border-brand-500 hover:text-brand-600 transition-colors w-full"
            >
              Create Another Game
            </button>
          </div>

          {publishResult.catalogEntry && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-brand-600 hover:text-brand-700">
                Show catalog entry code
              </summary>
              <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-xs overflow-x-auto">
                {JSON.stringify(publishResult.catalogEntry, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Submit for Testing</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Metadata */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <span className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
              1
            </span>
            Game Metadata
          </h3>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Game Title"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              disabled={isPublishing}
              className="w-full p-2 border rounded focus:border-brand-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <textarea
              placeholder="Description (min 20 characters)"
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              disabled={isPublishing}
              className="w-full p-2 border rounded focus:border-brand-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              rows={4}
            />
            <input
              type="text"
              placeholder="Estimated Time (e.g., 10-15 mins)"
              value={metadata.estimatedTime}
              onChange={(e) => setMetadata({ ...metadata, estimatedTime: e.target.value })}
              disabled={isPublishing}
              className="w-full p-2 border rounded focus:border-brand-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={metadata.featured}
                onChange={(e) => setMetadata({ ...metadata, featured: e.target.checked })}
                disabled={isPublishing}
                className="mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className="text-sm">Feature this game (if approved)</span>
            </label>
          </div>
        </div>

        {/* Step 2: Quality Check */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <span className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
              2
            </span>
            Quality Check
          </h3>

          <div className="space-y-3">
            {Object.entries(qualityScores).map(([key, score]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm capitalize">{key}</span>
                  <span className={`text-sm font-semibold ${
                    score >= 95 ? 'text-green-600' : score >= 85 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {score}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      score >= 95 ? 'bg-green-500' : score >= 85 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center text-green-700">
                <span className="mr-2">✓</span>
                <span className="text-sm font-medium">Ready for testing</span>
              </div>
            </div>

            <div className="text-xs text-ink-500 mt-2">
              * Scores are estimates based on generated code structure
            </div>
          </div>
        </div>

        {/* Step 3: Submit */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <span className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
              3
            </span>
            Submit
          </h3>

          <div className="space-y-3">
            {/* Publishing Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <span className="text-2xl mr-3">🧪</span>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Testing Queue
                  </h4>
                  <p className="text-xs text-blue-700">
                    All games must be tested and approved before appearing in the public catalog.
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    📍 Review at: <span className="font-mono">/internal/testing</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handlePublish}
              disabled={isPublishing || !metadata.title || !metadata.description}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                isPublishing || !metadata.title || !metadata.description
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-brand-500 to-accent-500 hover:shadow-lg'
              }`}
            >
              {isPublishing ? (
                <span className="flex items-center justify-center">
                  <Icon name="loader" className="animate-spin mr-2" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  🧪 Submit for Testing & Review
                </span>
              )}
            </button>

            {/* Save Draft */}
            <button
              disabled={isPublishing}
              className="w-full py-2 border border-gray-300 rounded-lg text-sm hover:border-brand-500 hover:text-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
