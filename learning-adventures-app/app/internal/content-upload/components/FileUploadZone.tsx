'use client';

import { useCallback } from 'react';
import Icon from '@/components/Icon';

interface FileUploadZoneProps {
  onFilesAdded: (files: File[]) => void;
}

export default function FileUploadZone({ onFilesAdded }: FileUploadZoneProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    onFilesAdded(files);
  }, [onFilesAdded]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    onFilesAdded(files);
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-brand-400 transition-colors bg-gray-50"
    >
      <Icon name="upload" size={48} className="mx-auto mb-4 text-gray-400" />
      <h3 className="text-lg font-semibold text-ink-900 mb-2">
        Drag & Drop Files Here
      </h3>
      <p className="text-gray-600 mb-4">
        or click to browse
      </p>
      <input
        type="file"
        multiple
        accept=".html,.zip,.mp4,.webm"
        onChange={handleFileSelect}
        className="hidden"
        id="file-input"
      />
      <label
        htmlFor="file-input"
        className="inline-block px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 cursor-pointer"
      >
        Choose Files
      </label>
      <p className="text-sm text-gray-500 mt-4">
        Supported: .html (games/lessons), .zip (course packages), .mp4 (videos)
      </p>
    </div>
  );
}
