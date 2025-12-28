'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Container from '@/components/Container';
import FileUploadZone from './components/FileUploadZone';
import UploadQueue from './components/UploadQueue';
import ContentLibrary from './components/ContentLibrary';

type UploadItem = {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: any;
};

function ContentUploadPage() {
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'courses'>('upload');
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);

  const handleFilesAdded = async (files: File[]) => {
    const newItems: UploadItem[] = files.map(file => ({
      id: `${Date.now()}-${file.name}`,
      file,
      progress: 0,
      status: 'pending' as const,
    }));

    setUploadQueue(prev => [...prev, ...newItems]);

    // Start uploads
    for (const item of newItems) {
      await uploadFile(item);
    }
  };

  const uploadFile = async (item: UploadItem) => {
    setUploadQueue(prev =>
      prev.map(i => i.id === item.id ? { ...i, status: 'uploading' as const } : i)
    );

    try {
      const formData = new FormData();
      formData.append('file', item.file);

      // Determine endpoint based on file type
      const isZip = item.file.name.endsWith('.zip');
      const endpoint = isZip
        ? '/api/internal/content-upload/course-package'
        : '/api/internal/content-upload';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      setUploadQueue(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, status: 'success' as const, progress: 100, result }
            : i
        )
      );
    } catch (error) {
      setUploadQueue(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
            : i
        )
      );
    }
  };

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900 mb-2">Content Upload</h1>
        <p className="text-gray-600">
          Upload games, lessons, or course packages. Files are published immediately.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('upload')}
          className={`pb-2 px-4 ${activeTab === 'upload' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-600'}`}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab('library')}
          className={`pb-2 px-4 ${activeTab === 'library' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-600'}`}
        >
          Content Library
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className={`pb-2 px-4 ${activeTab === 'courses' ? 'border-b-2 border-brand-500 text-brand-600' : 'text-gray-600'}`}
        >
          Course Builder
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'upload' && (
        <div>
          <FileUploadZone onFilesAdded={handleFilesAdded} />
          <UploadQueue items={uploadQueue} />
        </div>
      )}

      {activeTab === 'library' && <ContentLibrary />}

      {activeTab === 'courses' && (
        <div className="text-center py-12">
          <p className="text-gray-600">Course Builder coming soon...</p>
        </div>
      )}
    </Container>
  );
}

export default function Page() {
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <ContentUploadPage />
    </ProtectedRoute>
  );
}
