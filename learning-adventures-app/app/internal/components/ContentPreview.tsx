'use client';

import { useState, useEffect } from 'react';
import { ContentFormData, GeneratedContent } from '../types';
import { generateContent } from '../services/claudeApi';

interface ContentPreviewProps {
  formData: ContentFormData;
  generatedContent: GeneratedContent | null;
  onContentGenerated: (content: GeneratedContent) => void;
  onPublish: () => void;
  onBack: () => void;
}

export default function ContentPreview({
  formData,
  generatedContent,
  onContentGenerated,
  onPublish,
  onBack,
}: ContentPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [showEditingPanel, setShowEditingPanel] = useState(false);
  const [editPrompt, setEditPrompt] = useState('');
  const [isApplyingEdit, setIsApplyingEdit] = useState(false);
  const [showFixPanel, setShowFixPanel] = useState(false);
  const [fixPrompt, setFixPrompt] = useState('');
  const [isApplyingFix, setIsApplyingFix] = useState(false);

  useEffect(() => {
    if (!generatedContent) {
      // For uploaded content, create metadata immediately without AI generation
      if (formData.uploadSource === 'uploaded' && formData.uploadedZipPath) {
        const metadata = {
          id: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: formData.title,
          description: formData.gameIdea || 'Uploaded game',
          type: formData.type,
          category: formData.subject,
          gradeLevel: formData.gradeLevel,
          difficulty: formData.difficulty,
          skills: formData.skills,
          estimatedTime: formData.estimatedTime,
          featured: false,
          htmlPath: `/${formData.type}s/${formData.subscriptionTier}/${formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/`,
          subscriptionTier: formData.subscriptionTier,
          uploadedContent: true,
          platform: formData.uploadPlatform,
          sourceCodeUrl: formData.sourceCodeUrl,
        };
        onContentGenerated({ htmlContent: '', metadata });
      } else {
        // For AI-generated content, trigger generation
        handleGenerate();
      }
    }
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    try {
      // Prepare formData with description for the API
      const apiFormData = {
        ...formData,
        description: formData.gameIdea, // Use gameIdea as description for the API
      };

      const htmlContent = await generateContent(apiFormData);

      const metadata = {
        id: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: formData.title,
        description: formData.gameIdea, // Use gameIdea as description
        type: formData.type,
        category: formData.subject,
        gradeLevel: formData.gradeLevel,
        difficulty: formData.difficulty,
        skills: formData.skills,
        estimatedTime: formData.estimatedTime,
        featured: false,
        htmlPath: `/${formData.type}s/${formData.subscriptionTier}/${formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.html`,
        subscriptionTier: formData.subscriptionTier,
        uploadedContent: false,
      };

      onContentGenerated({ htmlContent, metadata });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate content'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyEdit = async () => {
    if (!editPrompt.trim() || !generatedContent) return;

    setIsApplyingEdit(true);
    setError('');
    try {
      // Prepare formData with the edit prompt as additional requirements
      const apiFormData = {
        ...formData,
        description: formData.gameIdea,
        additionalRequirements: `${formData.additionalRequirements || ''}\n\nEDIT REQUEST:\n${editPrompt}\n\nPlease apply these changes to the existing content while maintaining all current functionality.`,
      };

      const htmlContent = await generateContent(apiFormData);

      const metadata = {
        ...generatedContent.metadata,
        // Keep the same metadata but update any relevant fields
      };

      onContentGenerated({ htmlContent, metadata });
      setEditPrompt('');
      setShowEditingPanel(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply edits');
    } finally {
      setIsApplyingEdit(false);
    }
  };

  const handleApplyFix = async () => {
    if (!fixPrompt.trim() || !generatedContent) return;

    setIsApplyingFix(true);
    setError('');
    try {
      // Prepare formData with the fix prompt as a critical bug fix request
      const apiFormData = {
        ...formData,
        description: formData.gameIdea,
        additionalRequirements: `${formData.additionalRequirements || ''}\n\nURGENT BUG FIXES NEEDED:\n${fixPrompt}\n\nPlease fix these issues immediately while maintaining all other functionality. Focus on making the content work properly and be fully functional.`,
      };

      const htmlContent = await generateContent(apiFormData);

      const metadata = {
        ...generatedContent.metadata,
        // Keep the same metadata but update any relevant fields
      };

      onContentGenerated({ htmlContent, metadata });
      setFixPrompt('');
      setShowFixPanel(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply fixes');
    } finally {
      setIsApplyingFix(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Content Preview
        </h2>

        {/* Metadata Display */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="font-medium text-gray-700">{formData.title}</h3>
            <p className="text-gray-600 text-sm">{formData.gameIdea}</p>
            {formData.uploadSource === 'uploaded' && (
              <div className="mt-3 flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  📦 Uploaded Content
                </span>
                {formData.uploadPlatform && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {formData.uploadPlatform.charAt(0).toUpperCase() +
                      formData.uploadPlatform.slice(1)}
                  </span>
                )}
                {formData.subscriptionTier !== 'free' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {formData.subscriptionTier.charAt(0).toUpperCase() +
                      formData.subscriptionTier.slice(1)}{' '}
                    Tier
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600">
            <p>
              <strong>Type:</strong> {formData.type}
            </p>
            <p>
              <strong>Subject:</strong> {formData.subject}
            </p>
            <p>
              <strong>Grades:</strong> {formData.gradeLevel.join(', ')}
            </p>
            <p>
              <strong>Difficulty:</strong> {formData.difficulty}
            </p>
            {formData.projectType && (
              <p>
                <strong>Project Type:</strong>{' '}
                {formData.projectType === 'react-nextjs'
                  ? 'React/Next.js'
                  : 'HTML'}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Back to Edit
          </button>

          {!generatedContent && (
            <button
              onClick={() => handleGenerate()}
              disabled={isGenerating}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </button>
          )}

          {generatedContent && (
            <>
              {/* Only show AI editing features for AI-generated content */}
              {formData.uploadSource !== 'uploaded' && (
                <>
                  <button
                    onClick={() => {
                      setShowFixPanel(!showFixPanel);
                      if (showEditingPanel) setShowEditingPanel(false);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    🔧 Fix Issues
                  </button>

                  <button
                    onClick={() => {
                      setShowEditingPanel(!showEditingPanel);
                      if (showFixPanel) setShowFixPanel(false);
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    🎨 Edit & Improve
                  </button>

                  <button
                    onClick={() => handleGenerate()}
                    disabled={isGenerating}
                    className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    {isGenerating ? 'Regenerating...' : '🔄 Regenerate'}
                  </button>
                </>
              )}

              {/* Test button for uploaded content */}
              {formData.uploadSource === 'uploaded' &&
                formData.uploadedZipPath && (
                  <button
                    onClick={() => {
                      // Open the uploaded game in a new tab
                      const testPath =
                        formData.uploadedZipPath?.replace(
                          '/uploads/temp/',
                          '/uploads/temp/'
                        ) || '';
                      window.open(testPath, '_blank');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🧪 Test Game
                  </button>
                )}

              <button
                onClick={onPublish}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Publish to Catalog →
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Editing Panel */}
      {showEditingPanel && generatedContent && (
        <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🎨 Edit & Improve Content
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Describe what changes you'd like to make to improve the{' '}
            {formData.type}. Be specific about design, functionality, or
            educational elements.
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="editPrompt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                What would you like to improve?
              </label>
              <textarea
                id="editPrompt"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Examples:
• Add more colorful animations and visual feedback
• Make the buttons larger and more kid-friendly
• Add sound effects when students get answers right
• Include a progress bar to show completion
• Change the theme to be more engaging (space, ocean, etc.)
• Add hints or help features for struggling students"
              />
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">
                💡 Quick Improvement Suggestions
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Add more colorful animations',
                  'Include sound effects',
                  'Make it more responsive on mobile',
                  'Add visual progress indicators',
                  'Include encouraging messages',
                  'Change to a fun theme',
                  'Add difficulty levels',
                  'Include hints system',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      const newPrompt = editPrompt
                        ? `${editPrompt}\n• ${suggestion}`
                        : `• ${suggestion}`;
                      setEditPrompt(newPrompt);
                    }}
                    className="px-3 py-1 text-xs bg-white border border-purple-300 rounded-full text-purple-700 hover:bg-purple-100 transition-colors"
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApplyEdit}
                disabled={!editPrompt.trim() || isApplyingEdit}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {isApplyingEdit
                  ? 'Applying Changes...'
                  : '✨ Apply Improvements'}
              </button>

              <button
                onClick={() => {
                  setShowEditingPanel(false);
                  setEditPrompt('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fix Issues Panel */}
      {showFixPanel && generatedContent && (
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            🔧 Fix Issues
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Describe any problems, bugs, or issues you found with the{' '}
            {formData.type}. Be specific about what's not working correctly.
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="fixPrompt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                What issues need to be fixed?
              </label>
              <textarea
                id="fixPrompt"
                value={fixPrompt}
                onChange={(e) => setFixPrompt(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Examples:
• The buttons don't work when clicked
• Math problems are generating incorrectly
• The game doesn't respond to answers
• Content doesn't display properly on mobile
• JavaScript errors are showing in console
• The game freezes after a few questions
• Scoring system isn't working correctly"
              />
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-900 mb-2">
                🚨 Common Issues to Fix
              </h4>
              <div className="flex flex-wrap gap-2">
                {[
                  'Buttons not responding to clicks',
                  'JavaScript errors in console',
                  'Content not loading properly',
                  'Mobile display issues',
                  'Score/progress not updating',
                  'Game freezing or crashing',
                  'Audio not playing',
                  'Math calculations incorrect',
                  'Text overlapping or cut off',
                  'Animations not working',
                ].map((issue) => (
                  <button
                    key={issue}
                    type="button"
                    onClick={() => {
                      const newPrompt = fixPrompt
                        ? `${fixPrompt}\n• ${issue}`
                        : `• ${issue}`;
                      setFixPrompt(newPrompt);
                    }}
                    className="px-3 py-1 text-xs bg-white border border-red-300 rounded-full text-red-700 hover:bg-red-100 transition-colors"
                  >
                    + {issue}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-amber-800 text-sm">
                <strong>💡 Tip:</strong> Be as specific as possible about the
                issue. Include error messages, describe exactly what happens,
                and mention which parts of the {formData.type} are affected.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApplyFix}
                disabled={!fixPrompt.trim() || isApplyingFix}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isApplyingFix ? 'Applying Fixes...' : '🔧 Fix These Issues'}
              </button>

              <button
                onClick={() => {
                  setShowFixPanel(false);
                  setFixPrompt('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Preview */}
      {generatedContent && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {formData.uploadSource === 'uploaded'
              ? 'Uploaded Content Information'
              : 'Generated Content Preview'}
          </h3>

          {formData.uploadSource === 'uploaded' ? (
            /* Uploaded Content Info */
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-5xl">📦</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {generatedContent.metadata.title}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">
                          <strong>Type:</strong>{' '}
                          {formData.projectType === 'react-nextjs'
                            ? 'React/Next.js Project'
                            : 'HTML Game'}
                        </p>
                        <p className="text-gray-600">
                          <strong>Platform:</strong>{' '}
                          {formData.uploadPlatform?.charAt(0).toUpperCase() +
                            (formData.uploadPlatform?.slice(1) || '')}
                        </p>
                        <p className="text-gray-600">
                          <strong>Tier:</strong> {formData.subscriptionTier}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">
                          <strong>Category:</strong> {formData.subject}
                        </p>
                        <p className="text-gray-600">
                          <strong>Grades:</strong>{' '}
                          {formData.gradeLevel.join(', ')}
                        </p>
                        <p className="text-gray-600">
                          <strong>Difficulty:</strong> {formData.difficulty}
                        </p>
                      </div>
                    </div>
                    {formData.sourceCodeUrl && (
                      <div className="mt-3">
                        <a
                          href={formData.sourceCodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm underline"
                        >
                          🔗 View Source Code
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {formData.projectType === 'react-nextjs' && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-2xl">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm text-amber-800">
                        <strong>React/Next.js Project Detected</strong>
                        <br />
                        This project should be tested on the platform where it
                        was built ({formData.uploadPlatform}) before publishing.
                        Make sure it builds and runs correctly.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">
                  Ready to Publish
                </h5>
                <p className="text-sm text-gray-600 mb-3">
                  Your uploaded game is ready to be published to the{' '}
                  <strong>{formData.subscriptionTier}</strong> tier catalog. The
                  zip file will be extracted and made available to users.
                </p>
                <p className="text-sm text-gray-600">
                  Click "Publish to Catalog →" above to continue.
                </p>
              </div>
            </div>
          ) : (
            /* AI-Generated Content Preview */
            <>
              {/* Preview Frame - Fixed sandbox attributes */}
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 text-sm text-gray-600 border-b border-gray-300">
                  Preview: {generatedContent.metadata.title}
                </div>
                <div className="h-96 overflow-auto">
                  <iframe
                    srcDoc={generatedContent.htmlContent}
                    className="w-full h-full border-0"
                    title="Content Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals"
                    style={{ minHeight: '400px' }}
                  />
                </div>
              </div>

              {/* Full Screen Preview Option */}
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => {
                    const newWindow = window.open('', '_blank');
                    if (newWindow) {
                      newWindow.document.write(generatedContent.htmlContent);
                      newWindow.document.close();
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  🔍 Open in New Window
                </button>
              </div>

              {/* HTML Source Toggle */}
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  View HTML Source
                </summary>
                <div className="mt-2 bg-gray-50 rounded-md p-4 max-h-64 overflow-auto">
                  <pre className="text-xs text-gray-800">
                    <code>{generatedContent.htmlContent}</code>
                  </pre>
                </div>
              </details>
            </>
          )}
        </div>
      )}
    </div>
  );
}
