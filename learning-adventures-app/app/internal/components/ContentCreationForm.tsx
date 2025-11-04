'use client';

import { useState, useRef } from 'react';
import { ContentFormData } from '../types';
import { refineContentIdea } from '../services/claudeApi';

interface ContentCreationFormProps {
  onSubmit: (data: ContentFormData) => void;
}

export default function ContentCreationForm({ onSubmit }: ContentCreationFormProps) {
  const [formData, setFormData] = useState<ContentFormData>({
    type: 'game',
    subject: 'math',
    title: '',
    gameIdea: '',
    gradeLevel: [],
    difficulty: 'easy',
    skills: [],
    estimatedTime: '',
    concept: '',
    additionalRequirements: '',
    uploadSource: 'ai-generated',
    subscriptionTier: 'premium',
  });

  const [skillInput, setSkillInput] = useState('');
  const [refinements, setRefinements] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  const [showRefinements, setShowRefinements] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      setError('Only .zip files are supported');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File size exceeds 100MB limit');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch('/api/internal/upload-zip', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadProgress(100);
      setUploadedFile(file);

      // Extract metadata from the zip
      const metadataResponse = await fetch('/api/internal/extract-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zipPath: result.path }),
      });

      if (metadataResponse.ok) {
        const metadataResult = await metadataResponse.json();

        // Pre-fill form with extracted metadata
        if (metadataResult.metadata) {
          const meta = metadataResult.metadata;
          setFormData(prev => ({
            ...prev,
            title: meta.title || prev.title,
            gameIdea: meta.description || prev.gameIdea,
            concept: meta.category || prev.concept,
            gradeLevel: meta.gradeLevel || prev.gradeLevel,
            difficulty: meta.difficulty || prev.difficulty,
            skills: meta.skills || prev.skills,
            estimatedTime: meta.estimatedTime || prev.estimatedTime,
            uploadedZipPath: result.path,
            projectType: metadataResult.projectType,
            platform: meta.platform,
            sourceCodeUrl: meta.sourceCodeUrl,
          }));
        } else {
          // No metadata found, just store the path
          setFormData(prev => ({
            ...prev,
            uploadedZipPath: result.path,
            projectType: metadataResult.projectType,
          }));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadedFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on upload source
    if (formData.uploadSource === 'uploaded') {
      if (!formData.uploadedZipPath) {
        alert('Please upload a zip file first');
        return;
      }
      if (!formData.title || formData.gradeLevel.length === 0) {
        alert('Please fill in at least the title and grade levels');
        return;
      }
    } else {
      if (!formData.title || !formData.gameIdea || !formData.concept || formData.gradeLevel.length === 0) {
        alert('Please fill in all required fields');
        return;
      }
    }

    // Include refinements if they exist
    const finalFormData = {
      ...formData,
      additionalRequirements: refinements
        ? `${formData.additionalRequirements || ''}\n\nAI Refinements:\n${refinements}`
        : formData.additionalRequirements
    };

    onSubmit(finalFormData);
  };

  const handleRefine = async () => {
    if (!formData.title || !formData.gameIdea || !formData.concept || formData.gradeLevel.length === 0) {
      alert('Please fill in the basic information first (Title, Game Idea, Concept, and Grade Levels)');
      return;
    }

    setIsRefining(true);
    setError('');
    try {
      // Create a temporary formData with gameIdea as description for the API
      const tempFormData = {
        ...formData,
        description: formData.gameIdea
      };
      const response = await refineContentIdea(tempFormData);
      setRefinements(response.content);
      setShowRefinements(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get refinements');
    } finally {
      setIsRefining(false);
    }
  };

  const handleGradeLevelChange = (grade: string) => {
    setFormData(prev => ({
      ...prev,
      gradeLevel: prev.gradeLevel.includes(grade)
        ? prev.gradeLevel.filter(g => g !== grade)
        : [...prev.gradeLevel, grade]
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const grades = ['K', '1', '2', '3', '4', '5'];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Content</h2>
          <p className="mt-1 text-gray-600">Fill in the details for your educational content</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Content Source Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Source *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, uploadSource: 'ai-generated' }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.uploadSource === 'ai-generated'
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">🤖</span>
                  <h3 className="font-semibold">Generate with AI</h3>
                </div>
                <p className="text-sm text-gray-600">Use Claude AI to create content from your idea</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, uploadSource: 'uploaded' }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.uploadSource === 'uploaded'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className="text-2xl mr-2">📦</span>
                  <h3 className="font-semibold">Upload Zip File</h3>
                </div>
                <p className="text-sm text-gray-600">Upload game built with Base44, V0.dev, Replit, or Bolt</p>
              </button>
            </div>
          </div>

          {/* Zip Upload Section */}
          {formData.uploadSource === 'uploaded' && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Your Game</h3>

              {!uploadedFile ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-100 transition-colors"
                >
                  <div className="text-6xl mb-4">📦</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {isUploading ? 'Uploading...' : 'Drag & Drop ZIP File'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-500">
                    Supported: .zip files from Base44, V0.dev, Replit, Bolt (Max: 100MB)
                  </p>
                  {isUploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="bg-white border border-green-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">✅</span>
                      <div>
                        <p className="font-medium text-gray-900">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                          {formData.projectType && ` • ${formData.projectType === 'react-nextjs' ? 'React/Next.js' : 'HTML'} Project`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setFormData(prev => ({ ...prev, uploadedZipPath: undefined }));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              {/* Platform Selection */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Built with
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['base44', 'v0', 'replit', 'bolt', 'other'].map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, uploadPlatform: platform as any }))}
                      className={`px-3 py-2 rounded-md border text-sm transition-colors ${
                        formData.uploadPlatform === platform
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Code URL (Optional) */}
              <div className="mt-4">
                <label htmlFor="sourceCodeUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Source Code URL (Optional)
                </label>
                <input
                  type="url"
                  id="sourceCodeUrl"
                  value={formData.sourceCodeUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, sourceCodeUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://replit.com/@yourname/project"
                />
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Subscription Tier Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subscription Tier *
            </label>
            <div className="grid grid-cols-4 gap-3">
              {[
                { value: 'free', label: 'Free', desc: 'Available to all users', color: 'green' },
                { value: 'premium', label: 'Premium', desc: 'Subscription required', color: 'blue' },
                { value: 'custom', label: 'Custom', desc: 'Custom-built for client', color: 'purple' },
                { value: 'course', label: 'Course', desc: 'Full learning path', color: 'orange' },
              ].map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, subscriptionTier: tier.value as any }))}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    formData.subscriptionTier === tier.value
                      ? `border-${tier.color}-500 bg-${tier.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="font-semibold text-sm mb-1">{tier.label}</h4>
                  <p className="text-xs text-gray-600">{tier.desc}</p>
                </button>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              💡 Uploaded games default to <strong>Premium</strong>. Admins can change tier after publishing.
            </p>
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'game' }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.type === 'game'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold">Educational Game</h3>
                <p className="text-sm text-gray-600 mt-1">Interactive games that make learning fun</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'lesson' }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  formData.type === 'lesson'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-semibold">Interactive Lesson</h3>
                <p className="text-sm text-gray-600 mt-1">Structured learning activities</p>
              </button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subject: 'math' }))}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  formData.subject === 'math'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Math
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, subject: 'science' }))}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  formData.subject === 'science'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                Science
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter a catchy title for your content"
            />
          </div>

          {/* Game/Lesson Idea */}
          <div>
            <label htmlFor="gameIdea" className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === 'game' ? 'Game Idea' : 'Lesson Idea'} *
            </label>
            <textarea
              id="gameIdea"
              value={formData.gameIdea}
              onChange={(e) => setFormData(prev => ({ ...prev, gameIdea: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={formData.type === 'game'
                ? "Describe your game idea... What's the core gameplay? How do students learn while playing? What makes it engaging?"
                : "Describe your lesson idea... What activities will students do? How will they interact with the content? What's the learning progression?"
              }
            />
          </div>

          {/* Concept */}
          <div>
            <label htmlFor="concept" className="block text-sm font-medium text-gray-700 mb-2">
              Main Concept/Topic *
            </label>
            <input
              type="text"
              id="concept"
              value={formData.concept}
              onChange={(e) => setFormData(prev => ({ ...prev, concept: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., fractions, photosynthesis, multiplication tables"
            />
          </div>

          {/* Grade Levels */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Grade Levels * (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {grades.map(grade => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => handleGradeLevelChange(grade)}
                  className={`px-3 py-2 rounded-md border transition-colors ${
                    formData.gradeLevel.includes(grade)
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  Grade {grade}
                </button>
              ))}
            </div>
          </div>

          {/* AI Refinements Section */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-900 mb-2">🤖 AI Assistance</h3>
            <p className="text-sm text-purple-700 mb-3">
              Get AI-powered suggestions to improve your {formData.type} idea before generating content.
            </p>
            <button
              type="button"
              onClick={handleRefine}
              disabled={isRefining}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
            >
              {isRefining ? 'Getting Suggestions...' : '✨ Get AI Refinements'}
            </button>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Refinements Display */}
          {showRefinements && (
            <div className="bg-white border border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🤖 AI Suggestions for Improvement</h3>
              <div className="prose prose-sm max-w-none mb-4">
                <div className="bg-gray-50 p-4 rounded-md text-sm border">
                  <pre className="whitespace-pre-wrap">{refinements}</pre>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => {
                    // Apply refinements to the game idea
                    setFormData(prev => ({
                      ...prev,
                      gameIdea: `${prev.gameIdea}\n\n--- AI IMPROVEMENTS ---\n${refinements}`
                    }));
                    setShowRefinements(false);
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  ✨ Apply to Game Idea
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Apply refinements to additional requirements
                    setFormData(prev => ({
                      ...prev,
                      additionalRequirements: prev.additionalRequirements
                        ? `${prev.additionalRequirements}\n\nAI Refinements:\n${refinements}`
                        : `AI Refinements:\n${refinements}`
                    }));
                    setShowRefinements(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  📝 Add to Requirements
                </button>

                <button
                  type="button"
                  onClick={() => setShowRefinements(false)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Keep as Reference
                </button>
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills Taught
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter a skill and press Enter"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Estimated Time */}
          <div>
            <label htmlFor="estimatedTime" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Time
            </label>
            <input
              type="text"
              id="estimatedTime"
              value={formData.estimatedTime}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 15-20 mins"
            />
          </div>

          {/* Additional Requirements */}
          <div>
            <label htmlFor="additionalRequirements" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Requirements (Optional)
            </label>
            <textarea
              id="additionalRequirements"
              value={formData.additionalRequirements}
              onChange={(e) => setFormData(prev => ({ ...prev, additionalRequirements: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any specific features, themes, or requirements..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              {formData.uploadSource === 'uploaded' ? 'Continue to Preview' : 'Generate Content'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}