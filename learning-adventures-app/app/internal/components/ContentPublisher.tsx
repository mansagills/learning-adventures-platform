'use client';

import { useState } from 'react';
import { ContentFormData, GeneratedContent } from '../types';

interface ContentPublisherProps {
  content: GeneratedContent;
  formData: ContentFormData;
  onStartOver: () => void;
}

export default function ContentPublisher({
  content,
  formData,
  onStartOver,
}: ContentPublisherProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [error, setError] = useState('');

  const handlePublish = async () => {
    setIsPublishing(true);
    setError('');

    try {
      // Step 1: Save the content (HTML file or extract zip)
      const fileName = `${content.metadata.id}.html`;

      const saveResponse = await fetch('/api/internal/save-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.htmlContent,
          fileName,
          type: formData.type,
          subscriptionTier: formData.subscriptionTier,
          uploadedZipPath: formData.uploadedZipPath,
          uploadSource: formData.uploadSource,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save content');
      }

      const saveResult = await saveResponse.json();

      // Step 2: Update the catalog with all metadata including premium fields
      const catalogResponse = await fetch('/api/internal/update-catalog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata: {
            ...content.metadata,
            htmlPath: saveResult.filePath,
            subscriptionTier: formData.subscriptionTier,
            uploadedContent: formData.uploadSource === 'uploaded',
            platform: formData.uploadPlatform,
            sourceCodeUrl: formData.sourceCodeUrl,
          },
        }),
      });

      if (!catalogResponse.ok) {
        const errorData = await catalogResponse.json();
        throw new Error(errorData.error || 'Failed to update catalog');
      }

      setPublishStatus('success');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to publish content'
      );
      setPublishStatus('error');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Publish Content
        </h2>
        <p className="text-gray-600">
          Ready to publish "{content.metadata.title}" to the Learning Adventures
          catalog?
        </p>
      </div>

      {/* Content Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Content Summary
        </h3>

        {/* Upload/Tier Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {formData.uploadSource === 'uploaded' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              📦 Uploaded Content
            </span>
          )}
          {formData.uploadSource === 'ai-generated' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              🤖 AI-Generated
            </span>
          )}
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              formData.subscriptionTier === 'free'
                ? 'bg-green-100 text-green-800'
                : formData.subscriptionTier === 'premium'
                  ? 'bg-blue-100 text-blue-800'
                  : formData.subscriptionTier === 'custom'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-orange-100 text-orange-800'
            }`}
          >
            {formData.subscriptionTier.charAt(0).toUpperCase() +
              formData.subscriptionTier.slice(1)}{' '}
            Tier
          </span>
          {formData.uploadPlatform && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              {formData.uploadPlatform.charAt(0).toUpperCase() +
                formData.uploadPlatform.slice(1)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Basic Information
            </h4>
            <dl className="space-y-1 text-sm">
              <div>
                <dt className="inline font-medium text-gray-600">Title:</dt>
                <dd className="inline ml-1">{content.metadata.title}</dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-600">Type:</dt>
                <dd className="inline ml-1 capitalize">
                  {content.metadata.type}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-600">Subject:</dt>
                <dd className="inline ml-1 capitalize">
                  {content.metadata.category}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-600">ID:</dt>
                <dd className="inline ml-1 font-mono text-xs bg-gray-100 px-1 rounded">
                  {content.metadata.id}
                </dd>
              </div>
              {formData.sourceCodeUrl && (
                <div>
                  <dt className="inline font-medium text-gray-600">Source:</dt>
                  <dd className="inline ml-1">
                    <a
                      href={formData.sourceCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs underline"
                    >
                      View Code
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Educational Details
            </h4>
            <dl className="space-y-1 text-sm">
              <div>
                <dt className="inline font-medium text-gray-600">
                  Grade Levels:
                </dt>
                <dd className="inline ml-1">
                  {content.metadata.gradeLevel.join(', ')}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-600">
                  Difficulty:
                </dt>
                <dd className="inline ml-1 capitalize">
                  {content.metadata.difficulty}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-600">
                  Estimated Time:
                </dt>
                <dd className="inline ml-1">
                  {content.metadata.estimatedTime}
                </dd>
              </div>
              <div>
                <dt className="inline font-medium text-gray-600">File Path:</dt>
                <dd className="inline ml-1 font-mono text-xs bg-gray-100 px-1 rounded">
                  {content.metadata.htmlPath}
                </dd>
              </div>
              {formData.projectType && (
                <div>
                  <dt className="inline font-medium text-gray-600">
                    Project Type:
                  </dt>
                  <dd className="inline ml-1">
                    {formData.projectType === 'react-nextjs'
                      ? 'React/Next.js'
                      : 'HTML'}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Skills Taught</h4>
          <div className="flex flex-wrap gap-2">
            {content.metadata.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-medium text-gray-700 mb-2">Description</h4>
          <p className="text-sm text-gray-600">
            {content.metadata.description}
          </p>
        </div>
      </div>

      {/* Publishing Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Publishing Actions
        </h3>

        {publishStatus === 'idle' && (
          <div className="space-y-4">
            <p className="text-gray-600">
              This will save the HTML file to the public directory and add the
              content to the catalog.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
              >
                {isPublishing ? 'Publishing...' : 'Publish to Catalog'}
              </button>
              <button
                onClick={onStartOver}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel & Start Over
              </button>
            </div>
          </div>
        )}

        {publishStatus === 'success' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Successfully Published!
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your content has been added to the Learning Adventures
                    catalog.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <a
                href="/catalog"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                View in Catalog
              </a>
              <a
                href={content.metadata.htmlPath}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Test Content
              </a>
              <button
                onClick={onStartOver}
                className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
              >
                Create Another
              </button>
            </div>
          </div>
        )}

        {publishStatus === 'error' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Publishing Failed
                  </h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPublishStatus('idle');
                  setError('');
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
              >
                Try Again
              </button>
              <button
                onClick={onStartOver}
                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
