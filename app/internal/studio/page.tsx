'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PromptInput from '@/components/studio/PromptInput';
import LivePreview from '@/components/studio/LivePreview';
import IterationControls from '@/components/studio/IterationControls';
import PublishWorkflow from '@/components/studio/PublishWorkflow';

export default function ContentStudioPage() {
  const [currentContent, setCurrentContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIterating, setIsIterating] = useState(false);

  const handleGenerationStart = () => {
    setIsGenerating(true);
    setCurrentContent(null); // Clear previous content when starting new generation
  };

  const handleGenerate = async (content: any) => {
    setIsGenerating(false);
    if (content) {
      setCurrentContent(content);
    }
  };

  const handleGenerationError = () => {
    setIsGenerating(false);
    // Don't clear content on error
  };

  const handleIterationStart = () => {
    setIsIterating(true);
  };

  const handleIterate = async (updated: any) => {
    setIsIterating(false);
    if (updated) {
      setCurrentContent(updated);
    }
  };

  const handleIterationError = () => {
    setIsIterating(false);
    // Keep existing content on iteration error
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="max-w-[1800px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink-900 mb-2">
                ✨ Gemini 3 Content Studio
              </h1>
              <p className="text-ink-600">
                Create 2D and 3D educational games using natural language
                powered by Google Gemini 3
              </p>
            </div>

            {/* Status Badge */}
            <div className="px-4 py-2 bg-gradient-to-r from-brand-100 to-accent-100 rounded-lg border-2 border-brand-300">
              <p className="text-sm font-semibold text-brand-700">
                AI-Powered Game Creation
              </p>
              <p className="text-xs text-brand-600">~$0.30 per game</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Creation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PromptInput
              onGenerationStart={handleGenerationStart}
              onGenerate={handleGenerate}
              onGenerationError={handleGenerationError}
              isGenerating={isGenerating}
            />
            <LivePreview content={currentContent} isLoading={isGenerating} />
          </div>

          {/* Iteration & Publishing */}
          {currentContent && !isGenerating && (
            <>
              <IterationControls
                content={currentContent}
                onIterationStart={handleIterationStart}
                onIterate={handleIterate}
                onIterationError={handleIterationError}
                isIterating={isIterating}
              />
              <PublishWorkflow content={currentContent} />
            </>
          )}

          {/* Info Section */}
          {!currentContent && !isGenerating && (
            <div className="bg-gradient-to-br from-brand-50 to-accent-50 rounded-xl p-8 border-2 border-brand-200">
              <h3 className="text-xl font-semibold text-ink-900 mb-4">
                🎮 How It Works
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-3xl mb-2">1️⃣</div>
                  <h4 className="font-semibold text-ink-800 mb-1">
                    Describe Your Game
                  </h4>
                  <p className="text-sm text-ink-600">
                    Use natural language to describe the educational game you
                    want to create. Choose subject, grade level, and difficulty.
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">2️⃣</div>
                  <h4 className="font-semibold text-ink-800 mb-1">
                    Preview & Iterate
                  </h4>
                  <p className="text-sm text-ink-600">
                    See your game instantly in a live preview. Make improvements
                    with simple feedback like "add sound effects" or "make it
                    3D".
                  </p>
                </div>
                <div>
                  <div className="text-3xl mb-2">3️⃣</div>
                  <h4 className="font-semibold text-ink-800 mb-1">
                    Publish to Platform
                  </h4>
                  <p className="text-sm text-ink-600">
                    Save to Test Games for review or publish directly to the
                    catalog. Your game is ready for students!
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-white rounded-lg border border-brand-200">
                <p className="text-sm text-ink-700">
                  <strong>💡 Pro Tip:</strong> Be specific in your descriptions.
                  Instead of "make a math game", try "create a 3D space
                  adventure where students solve multiplication problems (2-12
                  tables) to navigate through asteroid fields".
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-2 text-sm text-ink-600">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="font-medium text-ink-800 mb-1">
                About Gemini 3 Content Studio
              </p>
              <p>
                This tool uses Google's latest Gemini 3 Pro model with "vibe
                coding" capabilities to generate complete, working educational
                games from natural language descriptions. All games are created
                as standalone HTML files with embedded CSS and JavaScript,
                making them easy to deploy and maintain.
              </p>
              <p className="mt-2">
                <strong>Requirements:</strong> Admin access required. Gemini API
                key must be configured in environment variables.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
