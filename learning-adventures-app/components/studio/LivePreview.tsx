'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/Icon';

interface LivePreviewProps {
  content: any;
  isLoading?: boolean;
}

type DeviceType = 'desktop' | 'tablet' | 'mobile';

export default function LivePreview({ content, isLoading = false }: LivePreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (content) {
      // Force iframe refresh when content changes
      setIframeKey(prev => prev + 1);
    }
  }, [content]);

  if (!content && !isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <div className="border-4 border-dashed border-gray-300 rounded-lg h-[600px] flex items-center justify-center">
          <div className="text-center text-ink-500">
            <div className="text-6xl mb-4">👁️</div>
            <p className="text-lg font-medium">No content to preview</p>
            <p className="text-sm mt-2">
              Generate a game to see the preview
            </p>
          </div>
        </div>
      </div>
    );
  }

  const deviceDimensions: Record<DeviceType, { width: string; height: string; maxWidth: string }> = {
    desktop: { width: '100%', height: '600px', maxWidth: '100%' },
    tablet: { width: '768px', height: '600px', maxWidth: '100%' },
    mobile: { width: '375px', height: '667px', maxWidth: '100%' }
  };

  const dimensions = deviceDimensions[device];

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
            🖥️ Desktop
          </button>
          <button
            onClick={() => setDevice('tablet')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              device === 'tablet'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-ink-600 hover:bg-gray-200'
            }`}
          >
            📱 Tablet
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              device === 'mobile'
                ? 'bg-brand-500 text-white'
                : 'bg-gray-100 text-ink-600 hover:bg-gray-200'
            }`}
          >
            📱 Mobile
          </button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="relative border-4 border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center min-h-[600px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10">
            <Icon name="loader" size={48} className="animate-spin text-brand-500 mb-4" />
            <p className="text-ink-600">Generating your game...</p>
            <p className="text-sm text-ink-500 mt-2">This may take 1-3 minutes</p>
          </div>
        ) : null}

        {content && (
          <div
            style={{
              width: dimensions.width,
              height: dimensions.height,
              maxWidth: dimensions.maxWidth,
            }}
            className="transition-all duration-300"
          >
            <iframe
              key={iframeKey}
              src={content.previewUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Game Preview"
            />
          </div>
        )}
      </div>

      {/* Metrics */}
      {content && !isLoading && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-ink-600">Generation Time</p>
            <p className="text-lg font-semibold text-ink-900">
              {content.generationTime ? (content.generationTime / 1000).toFixed(1) : '0'}s
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-ink-600">Tokens Used</p>
            <p className="text-lg font-semibold text-ink-900">
              {content.tokens?.total ? content.tokens.total.toLocaleString() : '0'}
            </p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-ink-600">Cost</p>
            <p className="text-lg font-semibold text-ink-900">
              ${content.estimatedCost ? content.estimatedCost.toFixed(3) : '0.000'}
            </p>
          </div>
        </div>
      )}

      {/* Full Screen Option */}
      {content && !isLoading && (
        <div className="mt-4 flex justify-center">
          <a
            href={content.previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-colors"
          >
            <Icon name="external-link" size={16} className="mr-2" />
            Open in New Tab
          </a>
        </div>
      )}
    </div>
  );
}
