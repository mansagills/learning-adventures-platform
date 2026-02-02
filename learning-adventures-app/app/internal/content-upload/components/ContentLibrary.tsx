'use client';

import { useEffect, useState } from 'react';
import Icon from '@/components/Icon';

interface UploadedContent {
  id: string;
  title: string;
  type: string;
  subject: string;
  filePath: string;
  createdAt: string;
  storageType: string;
}

export default function ContentLibrary() {
  const [content, setContent] = useState<UploadedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/internal/content-upload/list');
      const data = await response.json();
      setContent(data.content || []);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContent =
    filter === 'all'
      ? content
      : content.filter((c) => c.type.toLowerCase() === filter);

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-brand-500 text-white' : 'bg-gray-100'}`}
        >
          All ({content.length})
        </button>
        <button
          onClick={() => setFilter('game')}
          className={`px-4 py-2 rounded-lg ${filter === 'game' ? 'bg-brand-500 text-white' : 'bg-gray-100'}`}
        >
          Games ({content.filter((c) => c.type === 'GAME').length})
        </button>
        <button
          onClick={() => setFilter('lesson')}
          className={`px-4 py-2 rounded-lg ${filter === 'lesson' ? 'bg-brand-500 text-white' : 'bg-gray-100'}`}
        >
          Lessons ({content.filter((c) => c.type === 'LESSON').length})
        </button>
        <button
          onClick={() => setFilter('video')}
          className={`px-4 py-2 rounded-lg ${filter === 'video' ? 'bg-brand-500 text-white' : 'bg-gray-100'}`}
        >
          Videos ({content.filter((c) => c.type === 'VIDEO').length})
        </button>
      </div>

      {/* Content Grid */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredContent.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="inbox" size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No content uploaded yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <div key={item.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-ink-900">{item.title}</h4>
                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                  {item.storageType}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {item.type} • {item.subject}
              </p>
              <div className="flex gap-2 mt-4">
                <a
                  href={item.filePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-600 hover:underline"
                >
                  View →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
