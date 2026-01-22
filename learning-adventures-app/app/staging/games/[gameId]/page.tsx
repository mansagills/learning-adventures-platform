'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TestGame {
  id: string;
  gameId: string;
  title: string;
  description: string;
  category: string;
  type: string;
  gradeLevel: string[];
  difficulty: string;
  skills: string[];
  estimatedTime: string;
  filePath: string;
  status: string;
  createdAt: string;
}

export default function StagingGamePreviewPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  
  const [game, setGame] = useState<TestGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/unauthorized');
      return;
    }

    fetchGame();
  }, [session, status, gameId]);

  const fetchGame = async () => {
    try {
      const res = await fetch(`/api/admin/test-games?gameId=${gameId}`);
      const data = await res.json();
      
      if (data.games && data.games.length > 0) {
        setGame(data.games.find((g: TestGame) => g.gameId === gameId) || null);
      } else {
        setError('Game not found in staging');
      }
    } catch (err) {
      setError('Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game preview...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Game Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This game does not exist in staging.'}</p>
          <Link 
            href="/internal/testing"
            className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Testing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Bar */}
      <div className="bg-amber-500 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-amber-600 rounded-full text-sm font-medium">
              STAGING PREVIEW
            </span>
            <h1 className="font-bold">{game.title}</h1>
            <span className="text-amber-100 text-sm">
              Status: {game.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/internal/testing"
              className="px-4 py-2 bg-white text-amber-600 rounded-lg hover:bg-amber-50 font-medium text-sm"
            >
              Back to Testing
            </Link>
          </div>
        </div>
      </div>

      {/* Game Info Bar */}
      <div className="bg-white border-b px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-sm text-gray-600">
          <span><strong>Category:</strong> {game.category}</span>
          <span><strong>Grade:</strong> {game.gradeLevel.join(', ')}</span>
          <span><strong>Difficulty:</strong> {game.difficulty}</span>
          <span><strong>Time:</strong> {game.estimatedTime}</span>
          <span><strong>Skills:</strong> {game.skills.slice(0, 3).join(', ')}{game.skills.length > 3 ? '...' : ''}</span>
        </div>
      </div>

      {/* Game iframe */}
      <div className="p-4">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <iframe
            src={game.filePath}
            className="w-full h-[calc(100vh-200px)] min-h-[600px]"
            title={game.title}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        </div>
      </div>

      {/* Footer with quick actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Staging path: <code className="bg-gray-100 px-2 py-1 rounded">{game.filePath}</code>
          </p>
          <div className="flex items-center gap-3">
            <Link
              href={`/internal/testing?select=${game.id}`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
            >
              Review & Approve
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
