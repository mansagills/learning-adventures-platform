'use client';

import Icon from '@/components/Icon';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
}

export default function UploadQueue({ items }: { items: UploadItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Upload Queue</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-lg p-4 flex items-center gap-4"
          >
            {/* Icon */}
            <div className="flex-shrink-0">
              {item.status === 'success' && (
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="check" size={20} className="text-green-600" />
                </div>
              )}
              {item.status === 'error' && (
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Icon name="close" size={20} className="text-red-600" />
                </div>
              )}
              {(item.status === 'uploading' || item.status === 'pending') && (
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center">
                  <Icon
                    name="loader"
                    size={20}
                    className="text-brand-600 animate-spin"
                  />
                </div>
              )}
            </div>

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-medium text-ink-900 truncate">
                  {item.file.name}
                </p>
                <span className="text-sm text-gray-500 ml-2">
                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              {/* Progress Bar */}
              {(item.status === 'uploading' || item.status === 'pending') && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-500 h-2 rounded-full transition-all"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              )}

              {/* Success Message */}
              {item.status === 'success' && item.result && (
                <p className="text-sm text-green-600">
                  ✓ Published: {item.result.metadata?.title || item.file.name}
                </p>
              )}

              {/* Error Message */}
              {item.status === 'error' && (
                <p className="text-sm text-red-600">
                  ✗ {item.error || 'Upload failed'}
                </p>
              )}
            </div>

            {/* Storage Type Badge */}
            {item.result && (
              <div className="text-xs px-2 py-1 bg-gray-100 rounded">
                {item.result.storageType === 'BLOB' ? '☁️ Cloud' : '💾 Local'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
