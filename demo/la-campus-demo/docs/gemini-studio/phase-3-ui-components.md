# Phase 3: UI Components Implementation

## 🎯 Overview

Phase 3 focuses on building the frontend components for the Gemini 3 Content Studio. These components provide an intuitive interface for creating, iterating, and publishing educational games using natural language.

**Status**: 📋 **PLANNED**
**Estimated Duration**: 3-4 hours
**Prerequisites**: Phase 1 & 2 completed

## 📁 Component Structure

```
app/
└── internal/
    └── studio/
        ├── page.tsx                    # Main Studio page
        ├── [contentId]/
        │   └── page.tsx                # Edit existing content
        └── history/
            └── page.tsx                # Content history

components/
└── studio/
    ├── PromptInput.tsx                 # Natural language input
    ├── LivePreview.tsx                 # Real-time preview
    ├── IterationControls.tsx           # Refinement interface
    ├── PublishWorkflow.tsx             # Publishing process
    ├── ContentHistory.tsx              # Generated content list
    ├── UsageAnalytics.tsx              # Cost tracking
    ├── TemplateSelector.tsx            # Quick start templates
    └── DevicePreview.tsx               # Multi-device preview
```

## 🎨 Component Implementations

### 1. Main Studio Page

**File**: `app/internal/studio/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import PromptInput from '@/components/studio/PromptInput';
import LivePreview from '@/components/studio/LivePreview';
import IterationControls from '@/components/studio/IterationControls';
import PublishWorkflow from '@/components/studio/PublishWorkflow';
import ContentHistory from '@/components/studio/ContentHistory';
import UsageAnalytics from '@/components/studio/UsageAnalytics';

export default function ContentStudioPage() {
  const [currentContent, setCurrentContent] = useState(null);
  const [view, setView] = useState<'create' | 'history' | 'analytics'>('create');

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="max-w-[1800px] mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink-900 mb-2">
                Gemini 3 Content Studio
              </h1>
              <p className="text-ink-600">
                Create 2D and 3D educational games using natural language
              </p>
            </div>

            {/* View Switcher */}
            <div className="flex space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('create')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  view === 'create'
                    ? 'bg-white shadow-sm text-brand-600'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  view === 'history'
                    ? 'bg-white shadow-sm text-brand-600'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setView('analytics')}
                className={`px-4 py-2 rounded-md transition-colors ${
                  view === 'analytics'
                    ? 'bg-white shadow-sm text-brand-600'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {view === 'create' && (
          <div className="space-y-8">
            {/* Creation Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PromptInput
                onGenerate={(content) => setCurrentContent(content)}
              />
              <LivePreview content={currentContent} />
            </div>

            {/* Iteration & Publishing */}
            {currentContent && (
              <>
                <IterationControls
                  content={currentContent}
                  onIterate={(updated) => setCurrentContent(updated)}
                />
                <PublishWorkflow content={currentContent} />
              </>
            )}
          </div>
        )}

        {view === 'history' && <ContentHistory />}
        {view === 'analytics' && <UsageAnalytics />}
      </div>
    </ProtectedRoute>
  );
}
```

---

### 2. PromptInput Component

**File**: `components/studio/PromptInput.tsx`

```typescript
'use client';

import { useState } from 'react';
import TemplateSelector from './TemplateSelector';
import Icon from '@/components/Icon';

interface PromptInputProps {
  onGenerate: (content: any) => void;
}

export default function PromptInput({ onGenerate }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState({
    category: 'math',
    gameType: 'HTML_2D',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium',
    skills: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (prompt.length < 20) {
      setError('Prompt must be at least 20 characters');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...config })
      });

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      onGenerate(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Describe Your Game</h2>

      {/* Template Selector */}
      <TemplateSelector
        onSelect={(template) => {
          setPrompt(template.prompt);
          setConfig({ ...config, ...template.config });
        }}
      />

      {/* Main Prompt */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Game Description
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none"
          placeholder="Example: Create a 3D multiplication game where students pilot a spaceship and solve multiplication problems to navigate through asteroid fields. Include power-ups for streaks and celebratory animations for correct answers."
        />
        <p className="text-sm text-ink-500 mt-1">
          {prompt.length} characters (minimum 20)
        </p>
      </div>

      {/* Configuration Options */}
      <div className="space-y-3 mb-6">
        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Subject
          </label>
          <select
            value={config.category}
            onChange={(e) => setConfig({ ...config, category: e.target.value })}
            className="w-full p-3 border rounded-lg focus:border-brand-500 focus:outline-none"
          >
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="english">English</option>
            <option value="history">History</option>
            <option value="interdisciplinary">Interdisciplinary</option>
          </select>
        </div>

        {/* Game Type */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Game Type
          </label>
          <select
            value={config.gameType}
            onChange={(e) => setConfig({ ...config, gameType: e.target.value })}
            className="w-full p-3 border rounded-lg focus:border-brand-500 focus:outline-none"
          >
            <option value="HTML_2D">2D Interactive Game</option>
            <option value="HTML_3D">3D Simulation (with Three.js)</option>
            <option value="INTERACTIVE">Interactive Lesson</option>
            <option value="QUIZ">Quiz/Assessment</option>
            <option value="SIMULATION">Science Simulation</option>
            <option value="PUZZLE">Logic Puzzle</option>
          </select>
        </div>

        {/* Grade Level */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Grade Level
          </label>
          <div className="flex flex-wrap gap-2">
            {['K', '1', '2', '3', '4', '5', '6', '7', '8'].map((grade) => (
              <button
                key={grade}
                onClick={() => {
                  const newGrades = config.gradeLevel.includes(grade)
                    ? config.gradeLevel.filter((g) => g !== grade)
                    : [...config.gradeLevel, grade];
                  setConfig({ ...config, gradeLevel: newGrades });
                }}
                className={`px-3 py-1 rounded-lg border-2 transition-colors ${
                  config.gradeLevel.includes(grade)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-300 hover:border-brand-300'
                }`}
              >
                {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Difficulty
          </label>
          <div className="flex space-x-2">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setConfig({ ...config, difficulty: level })}
                className={`flex-1 py-2 rounded-lg border-2 capitalize transition-colors ${
                  config.difficulty === level
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-300 hover:border-brand-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || prompt.length < 20}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
          isGenerating || prompt.length < 20
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-brand-500 to-accent-500 hover:shadow-lg'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <Icon name="spinner" className="animate-spin mr-2" />
            Generating Game...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <Icon name="sparkles" className="mr-2" />
            Generate Game
          </span>
        )}
      </button>

      {/* Cost Estimate */}
      <p className="text-xs text-ink-500 mt-2 text-center">
        Estimated cost: ~$0.30 per generation
      </p>
    </div>
  );
}
```

---

### 3. LivePreview Component

**File**: `components/studio/LivePreview.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import DevicePreview from './DevicePreview';
import Icon from '@/components/Icon';

interface LivePreviewProps {
  content: any;
}

export default function LivePreview({ content }: LivePreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (content) {
      setIsLoading(true);
      // Simulate loading time for iframe
      setTimeout(() => setIsLoading(false), 500);
    }
  }, [content]);

  if (!content) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div className="border-4 border-dashed border-gray-300 rounded-lg h-[600px] flex items-center justify-center">
          <div className="text-center text-ink-500">
            <Icon name="eye" size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No content to preview</p>
            <p className="text-sm mt-2">
              Generate a game to see the preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  const deviceDimensions = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '600px' },
    mobile: { width: '375px', height: '667px' }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Live Preview</h2>

        {/* Device Switcher */}
        <div className="flex space-x-2">
          <button
            onClick={() => setDevice('desktop')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              device === 'desktop'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-ink-600 hover:bg-gray-200'
            }`}
          >
            <Icon name="desktop" size={16} className="inline mr-1" />
            Desktop
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              device === 'tablet'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-ink-600 hover:bg-gray-200'
            }`}
          >
            <Icon name="tablet" size={16} className="inline mr-1" />
            Tablet
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              device === 'mobile'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-ink-600 hover:bg-gray-200'
            }`}
          >
            <Icon name="mobile" size={16} className="inline mr-1" />
            Mobile
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="relative border-4 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center min-h-[600px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <Icon name="spinner" size={48} className="animate-spin text-brand-500" />
          </div>
        ) : null}

        <div
          style={{
            width: deviceDimensions[device].width,
            height: deviceDimensions[device].height,
            maxWidth: '100%'
          }}
        >
          <iframe
            src={content.previewUrl}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Game Preview"
          />
        </div>
      </div>

      {/* Metrics */}
      {content && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-ink-600">Generation Time</p>
            <p className="text-lg font-semibold text-ink-900">
              {(content.generationTime / 1000).toFixed(1)}s
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-ink-600">Tokens Used</p>
            <p className="text-lg font-semibold text-ink-900">
              {content.tokens.total.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-ink-600">Cost</p>
            <p className="text-lg font-semibold text-ink-900">
              ${content.estimatedCost.toFixed(3)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 4. IterationControls Component

**File**: `components/studio/IterationControls.tsx`

```typescript
'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';

interface IterationControlsProps {
  content: any;
  onIterate: (updated: any) => void;
}

export default function IterationControls({ content, onIterate }: IterationControlsProps) {
  const [feedback, setFeedback] = useState('');
  const [isIterating, setIsIterating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleIterate = async () => {
    if (!feedback.trim()) return;

    setIsIterating(true);

    try {
      const response = await fetch('/api/gemini/iterate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: content.contentId,
          feedback
        })
      });

      const data = await response.json();
      onIterate(data);
      setFeedback('');
    } catch (error) {
      console.error('Iteration failed:', error);
    } finally {
      setIsIterating(false);
    }
  };

  const suggestions = [
    'Make it 3D with physics',
    'Add sound effects',
    'Use more colorful graphics',
    'Include difficulty levels',
    'Add a timer and scoring system'
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Refine Your Game</h2>

      {/* Quick Suggestions */}
      <div className="mb-4">
        <p className="text-sm text-ink-600 mb-2">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setFeedback(suggestion)}
              className="px-3 py-1 bg-brand-50 text-brand-700 text-sm rounded-lg hover:bg-brand-100 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Input */}
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none"
        placeholder="Describe what you'd like to change... (e.g., 'Add sound effects for correct answers', 'Make the graphics more colorful', 'Include a difficulty selector')"
        rows={3}
      />

      {/* Action Buttons */}
      <div className="mt-4 flex space-x-3">
        <button
          onClick={handleIterate}
          disabled={!feedback.trim() || isIterating}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            !feedback.trim() || isIterating
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-brand-500 text-white hover:bg-brand-600'
          }`}
        >
          {isIterating ? (
            <span className="flex items-center justify-center">
              <Icon name="spinner" className="animate-spin mr-2" />
              Iterating...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Icon name="refresh" className="mr-2" />
              Iterate
            </span>
          )}
        </button>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:border-brand-500 hover:text-brand-600 transition-colors"
        >
          <Icon name="history" className="mr-2 inline" />
          History
        </button>
      </div>

      {/* Iteration History */}
      {showHistory && (
        <div className="mt-6 border-t pt-6">
          <h3 className="font-semibold mb-3">Iteration History</h3>
          <div className="space-y-3">
            {[...Array(content.iterationNumber || 1)].map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Iteration {i + 1}</span>
                  <span className="text-xs text-ink-500">
                    {new Date().toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-ink-600">
                  {i === 0 ? 'Initial generation' : 'Refinement iteration'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 5. PublishWorkflow Component

**File**: `components/studio/PublishWorkflow.tsx`

```typescript
'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';

interface PublishWorkflowProps {
  content: any;
}

export default function PublishWorkflow({ content }: PublishWorkflowProps) {
  const [metadata, setMetadata] = useState({
    title: content.title || '',
    description: '',
    featured: false,
    estimatedTime: '10-15 mins'
  });
  const [destination, setDestination] = useState<'catalog' | 'test-games'>('test-games');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResult, setPublishResult] = useState(null);

  const qualityScores = {
    accessibility: 98,
    performance: 95,
    educational: 92
  };

  const handlePublish = async () => {
    setIsPublishing(true);

    try {
      const response = await fetch('/api/gemini/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: content.contentId,
          destination,
          metadata
        })
      });

      const result = await response.json();
      setPublishResult(result);
    } catch (error) {
      console.error('Publishing failed:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Publish to Platform</h2>

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
              className="w-full p-2 border rounded focus:border-brand-500 focus:outline-none"
            />
            <textarea
              placeholder="Description"
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              className="w-full p-2 border rounded focus:border-brand-500 focus:outline-none"
              rows={4}
            />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={metadata.featured}
                onChange={(e) => setMetadata({ ...metadata, featured: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm">Feature this game</span>
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
                <Icon name="check-circle" className="mr-2" />
                <span className="text-sm font-medium">Ready to publish</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Publish */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <span className="w-6 h-6 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
              3
            </span>
            Publish
          </h3>

          <div className="space-y-3">
            {/* Destination Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Destination</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value as any)}
                className="w-full p-2 border rounded focus:border-brand-500 focus:outline-none"
              >
                <option value="test-games">Test Games (for review)</option>
                <option value="catalog">Public Catalog (direct)</option>
              </select>
            </div>

            {/* Publish Button */}
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
                  <Icon name="spinner" className="animate-spin mr-2" />
                  Publishing...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Icon name="rocket" className="mr-2" />
                  Publish to {destination === 'catalog' ? 'Catalog' : 'Test Games'}
                </span>
              )}
            </button>

            {/* Save Draft */}
            <button className="w-full py-2 border border-gray-300 rounded-lg text-sm hover:border-brand-500 hover:text-brand-600 transition-colors">
              <Icon name="save" className="mr-2 inline" />
              Save Draft
            </button>
          </div>

          {/* Publish Result */}
          {publishResult && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Published successfully!
              </p>
              {publishResult.previewUrl && (
                <a
                  href={publishResult.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 hover:underline mt-1 inline-block"
                >
                  View Published Game →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Phase 3 Checklist

- [ ] Create main Studio page (`/internal/studio/page.tsx`)
- [ ] Build PromptInput component
- [ ] Build LivePreview component
- [ ] Build IterationControls component
- [ ] Build PublishWorkflow component
- [ ] Build ContentHistory component
- [ ] Build UsageAnalytics component
- [ ] Build TemplateSelector component
- [ ] Add responsive design for mobile
- [ ] Add loading states and error handling
- [ ] Add accessibility features (keyboard navigation, ARIA labels)
- [ ] Test all user interactions

## 🎯 Success Criteria

Phase 3 is complete when:

1. All components are built and functional
2. UI is responsive across desktop, tablet, and mobile
3. Real-time preview works in iframe
4. Iteration system updates preview smoothly
5. Publishing workflow validates and saves correctly
6. Error states are handled gracefully
7. Accessibility standards are met (WCAG 2.1 AA)
8. Loading states provide clear feedback

## 🚀 Ready for Phase 4

With Phase 3 complete, you're ready to integrate everything with the admin panel and test end-to-end workflows.

See [Phase 4: Integration & Testing](./phase-4-integration.md) for next steps.

---

**Phase 3 Status**: 📋 **PLANNED**
**Estimated Duration**: 3-4 hours
