'use client';

/**
 * File Uploader Component
 *
 * Drag-and-drop file uploader for agent conversations.
 * Supports: MD, PDF, DOCX files, and images (PNG, JPG, GIF, WEBP)
 */

import { useState, useCallback, useRef } from 'react';

interface UploadedFileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
  previewUrl?: string; // For image previews
}

interface FileUploaderProps {
  conversationId?: string;
  onFileUploaded?: (fileId: string) => void;
  maxFileSizeMB?: number;
}

export default function FileUploader({
  conversationId,
  onFileUploaded,
  maxFileSizeMB = 10,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = [
    'text/markdown',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
  ];

  const allowedExtensions = [
    '.md',
    '.pdf',
    '.docx',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.webp',
  ];

  const isImageFile = (fileName: string): boolean => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '');
  };

  const validateFile = (file: File): string | null => {
    // Check file type
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return `File type not supported. Please upload MD, PDF, DOCX, or image files (PNG, JPG, GIF, WEBP).`;
    }

    // Check file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxFileSizeMB}MB limit.`;
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const tempId = Math.random().toString(36);

    // Create preview URL for images
    let previewUrl: string | undefined;
    if (isImageFile(file.name)) {
      previewUrl = URL.createObjectURL(file);
    }

    const fileInfo: UploadedFileInfo = {
      id: tempId,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      previewUrl,
    };

    setUploadedFiles((prev) => [...prev, fileInfo]);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (conversationId) {
        formData.append('conversationId', conversationId);
      }

      const response = await fetch('/api/agents/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      const data = await response.json();

      // Update file status
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? { ...f, id: data.fileId, status: 'completed' as const }
            : f
        )
      );

      // Notify parent
      if (onFileUploaded) {
        onFileUploaded(data.fileId);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.id === tempId
            ? {
                ...f,
                status: 'failed' as const,
                error: error instanceof Error ? error.message : 'Upload failed',
              }
            : f
        )
      );
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        alert(error);
        return;
      }
      uploadFile(file);
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'md') return '📝';
    if (ext === 'pdf') return '📄';
    if (ext === 'docx') return '📘';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) return '🖼️';
    return '📎';
  };

  return (
    <div className="w-full">
      {/* Drag and Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${
            isDragging
              ? 'border-brand-500 bg-brand-50'
              : 'border-neutral-300 hover:border-brand-400 hover:bg-neutral-50'
          }
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="text-4xl mb-2">📎</div>
        <p className="text-neutral-700 font-medium mb-1">
          Drop files here or click to browse
        </p>
        <p className="text-sm text-neutral-500">
          Supports MD, PDF, DOCX, and images (PNG, JPG, GIF, WEBP)
        </p>
        <p className="text-xs text-neutral-400 mt-1">
          Max {maxFileSizeMB}MB per file
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".md,.pdf,.docx,.png,.jpg,.jpeg,.gif,.webp"
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 bg-white border border-neutral-200 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Image Preview or Icon */}
                {file.previewUrl ? (
                  <img
                    src={file.previewUrl}
                    alt={file.name}
                    className="w-12 h-12 object-cover rounded border border-neutral-200"
                  />
                ) : (
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {file.status === 'uploading' && (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-neutral-500">
                      Uploading...
                    </span>
                  </div>
                )}

                {file.status === 'completed' && (
                  <div className="flex items-center gap-1 text-green-600">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs">Uploaded</span>
                  </div>
                )}

                {file.status === 'failed' && (
                  <div className="flex items-center gap-1 text-red-600">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-xs">{file.error || 'Failed'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
