'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  status: 'NOT_TESTED' | 'IN_TESTING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  catalogued: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    approvals: number;
    feedback: number;
  };
}

interface GameApproval {
  id: string;
  userName: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  notes: string | null;
  educationalQuality: boolean | null;
  technicalQuality: boolean | null;
  accessibilityCompliant: boolean | null;
  ageAppropriate: boolean | null;
  engagementLevel: number | null;
  createdAt: string;
}

interface GameFeedback {
  id: string;
  userName: string;
  feedbackType: string;
  message: string;
  issueSeverity: string | null;
  createdAt: string;
}

export default function TestGamesAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<TestGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<TestGame | null>(null);
  const [gameApprovals, setGameApprovals] = useState<GameApproval[]>([]);
  const [gameFeedback, setGameFeedback] = useState<GameFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showGamePreview, setShowGamePreview] = useState(false);

  // Approval form state
  const [approvalForm, setApprovalForm] = useState({
    decision: 'APPROVE' as 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    notes: '',
    educationalQuality: true,
    technicalQuality: true,
    accessibilityCompliant: true,
    ageAppropriate: true,
    engagementLevel: 5
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    feedbackType: 'GENERAL' as 'BUG' | 'SUGGESTION' | 'PRAISE' | 'ACCESSIBILITY_ISSUE' | 'CONTENT_ERROR' | 'GENERAL',
    message: '',
    issueSeverity: null as 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL' | null
  });

  // Check if user is admin
  useEffect(() => {
    if (status === 'loading') return;
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/');
    }
  }, [session, status, router]);

  // Fetch games
  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const res = await fetch('/api/admin/test-games');
      const data = await res.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameDetails = async (gameId: string) => {
    try {
      const res = await fetch(`/api/admin/test-games/${gameId}`);
      const data = await res.json();
      setGameApprovals(data.approvals || []);
      setGameFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching game details:', error);
    }
  };

  const handleSelectGame = (game: TestGame) => {
    setSelectedGame(game);
    fetchGameDetails(game.id);
  };

  const handleUpdateStatus = async (gameId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/test-games/${gameId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchGames();
      if (selectedGame?.id === gameId) {
        setSelectedGame({ ...selectedGame, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSubmitApproval = async () => {
    if (!selectedGame) return;

    try {
      await fetch(`/api/admin/test-games/${selectedGame.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(approvalForm)
      });

      setShowApprovalModal(false);
      fetchGames();
      fetchGameDetails(selectedGame.id);

      // Reset form
      setApprovalForm({
        decision: 'APPROVE',
        notes: '',
        educationalQuality: true,
        technicalQuality: true,
        accessibilityCompliant: true,
        ageAppropriate: true,
        engagementLevel: 5
      });
    } catch (error) {
      console.error('Error submitting approval:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedGame) return;

    try {
      await fetch(`/api/admin/test-games/${selectedGame.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm)
      });

      setShowFeedbackModal(false);
      fetchGameDetails(selectedGame.id);

      // Reset form
      setFeedbackForm({
        feedbackType: 'GENERAL',
        message: '',
        issueSeverity: null
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handlePromoteToCatalog = async (gameId: string) => {
    if (!confirm('Promote this game to the public catalog? This will make it visible to all users.')) return;

    try {
      const res = await fetch(`/api/admin/test-games/${gameId}/promote`, {
        method: 'POST'
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Game promoted to catalog successfully!');
        fetchGames();
        if (selectedGame?.id === gameId) {
          setSelectedGame({ ...selectedGame, catalogued: true });
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error promoting game:', error);
      alert('Failed to promote game to catalog');
    }
  };

  const filteredGames = filter === 'ALL'
    ? games
    : games.filter(g => g.status === filter);

  const statusColors = {
    NOT_TESTED: 'bg-gray-100 text-gray-800',
    IN_TESTING: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    NEEDS_REVISION: 'bg-yellow-100 text-yellow-800'
  };

  const decisionColors = {
    APPROVE: 'text-green-600',
    REJECT: 'text-red-600',
    REQUEST_CHANGES: 'text-yellow-600'
  };

  if (status === 'loading' || loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🎮 Game Testing & Approval Dashboard</h1>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['ALL', 'NOT_TESTED', 'IN_TESTING', 'APPROVED', 'NEEDS_REVISION', 'REJECTED'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {status.replace('_', ' ')}
              <span className="ml-2 text-sm">
                ({status === 'ALL' ? games.length : games.filter(g => g.status === status).length})
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Games List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Test Games</h2>
            <div className="space-y-3">
              {filteredGames.map(game => (
                <div
                  key={game.id}
                  onClick={() => handleSelectGame(game)}
                  className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                    selectedGame?.id === game.id
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{game.title}</h3>
                    {game.catalogued && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        📚 Cataloged
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{game.description.substring(0, 80)}...</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${statusColors[game.status]}`}>
                      {game.status.replace('_', ' ')}
                    </span>
                    <div className="text-xs text-gray-500">
                      💬 {game._count.feedback} | ✅ {game._count.approvals}
                    </div>
                  </div>
                </div>
              ))}
              {filteredGames.length === 0 && (
                <p className="text-center text-gray-500 py-8">No games found with this filter</p>
              )}
            </div>
          </div>

          {/* Game Details Panel */}
          <div className="lg:col-span-2">
            {selectedGame ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedGame.title}</h2>
                      <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full font-medium ${statusColors[selectedGame.status]}`}>
                        {selectedGame.status.replace('_', ' ')}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowGamePreview(!showGamePreview)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {showGamePreview ? 'Hide' : 'Preview'} Game
                    </button>
                  </div>

                  {showGamePreview && (
                    <div className="mb-4 border-4 border-blue-200 rounded-lg overflow-hidden">
                      <iframe
                        src={selectedGame.filePath}
                        className="w-full h-[600px]"
                        title={selectedGame.title}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div><strong>Category:</strong> {selectedGame.category}</div>
                    <div><strong>Type:</strong> {selectedGame.type}</div>
                    <div><strong>Grade Level:</strong> {selectedGame.gradeLevel.join(', ')}</div>
                    <div><strong>Difficulty:</strong> {selectedGame.difficulty}</div>
                    <div><strong>Time:</strong> {selectedGame.estimatedTime}</div>
                    <div><strong>Skills:</strong> {selectedGame.skills.join(', ')}</div>
                  </div>

                  <p className="text-gray-600 mb-4">{selectedGame.description}</p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setShowApprovalModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      ✅ Approve/Review
                    </button>
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      💬 Add Feedback
                    </button>
                    {selectedGame.status === 'APPROVED' && !selectedGame.catalogued && (
                      <button
                        onClick={() => handlePromoteToCatalog(selectedGame.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        🚀 Promote to Catalog
                      </button>
                    )}
                    <select
                      value={selectedGame.status}
                      onChange={(e) => handleUpdateStatus(selectedGame.id, e.target.value)}
                      className="px-4 py-2 border rounded-lg"
                    >
                      <option value="NOT_TESTED">Not Tested</option>
                      <option value="IN_TESTING">In Testing</option>
                      <option value="APPROVED">Approved</option>
                      <option value="NEEDS_REVISION">Needs Revision</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Approval History */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Approval History ({gameApprovals.length})</h3>
                  <div className="space-y-3">
                    {gameApprovals.map(approval => (
                      <div key={approval.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">{approval.userName}</span>
                          <span className={`font-bold ${decisionColors[approval.decision]}`}>
                            {approval.decision.replace('_', ' ')}
                          </span>
                        </div>
                        {approval.notes && <p className="text-sm text-gray-700 mb-2">{approval.notes}</p>}
                        <div className="text-xs text-gray-500 grid grid-cols-2 gap-2">
                          {approval.educationalQuality !== null && <div>Educational: {approval.educationalQuality ? '✅' : '❌'}</div>}
                          {approval.technicalQuality !== null && <div>Technical: {approval.technicalQuality ? '✅' : '❌'}</div>}
                          {approval.accessibilityCompliant !== null && <div>Accessibility: {approval.accessibilityCompliant ? '✅' : '❌'}</div>}
                          {approval.ageAppropriate !== null && <div>Age Appropriate: {approval.ageAppropriate ? '✅' : '❌'}</div>}
                          {approval.engagementLevel && <div>Engagement: {'⭐'.repeat(approval.engagementLevel)}</div>}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(approval.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {gameApprovals.length === 0 && (
                      <p className="text-gray-500 text-sm">No approvals yet</p>
                    )}
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Feedback & Notes ({gameFeedback.length})</h3>
                  <div className="space-y-3">
                    {gameFeedback.map(feedback => (
                      <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">{feedback.userName}</span>
                          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {feedback.feedbackType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{feedback.message}</p>
                        {feedback.issueSeverity && (
                          <span className="text-xs text-red-600 font-medium">
                            Severity: {feedback.issueSeverity}
                          </span>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(feedback.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                    {gameFeedback.length === 0 && (
                      <p className="text-gray-500 text-sm">No feedback yet</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
                <div className="text-6xl mb-4">🎮</div>
                <p className="text-xl">Select a game to view details and approve</p>
              </div>
            )}
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">Review: {selectedGame.title}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Decision</label>
                  <select
                    value={approvalForm.decision}
                    onChange={(e) => setApprovalForm({...approvalForm, decision: e.target.value as any})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="APPROVE">Approve</option>
                    <option value="REQUEST_CHANGES">Request Changes</option>
                    <option value="REJECT">Reject</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2">Notes</label>
                  <textarea
                    value={approvalForm.notes}
                    onChange={(e) => setApprovalForm({...approvalForm, notes: e.target.value})}
                    className="w-full p-2 border rounded-lg h-24"
                    placeholder="Add notes about your decision..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={approvalForm.educationalQuality}
                      onChange={(e) => setApprovalForm({...approvalForm, educationalQuality: e.target.checked})}
                      className="w-4 h-4"
                    />
                    Educational Quality
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={approvalForm.technicalQuality}
                      onChange={(e) => setApprovalForm({...approvalForm, technicalQuality: e.target.checked})}
                      className="w-4 h-4"
                    />
                    Technical Quality
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={approvalForm.accessibilityCompliant}
                      onChange={(e) => setApprovalForm({...approvalForm, accessibilityCompliant: e.target.checked})}
                      className="w-4 h-4"
                    />
                    Accessibility Compliant
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={approvalForm.ageAppropriate}
                      onChange={(e) => setApprovalForm({...approvalForm, ageAppropriate: e.target.checked})}
                      className="w-4 h-4"
                    />
                    Age Appropriate
                  </label>
                </div>

                <div>
                  <label className="block font-medium mb-2">Engagement Level</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={approvalForm.engagementLevel}
                    onChange={(e) => setApprovalForm({...approvalForm, engagementLevel: parseInt(e.target.value)})}
                    className="w-full"
                  />
                  <div className="text-center text-2xl">
                    {'⭐'.repeat(approvalForm.engagementLevel)}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSubmitApproval}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Submit Review
                  </button>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && selectedGame && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h3 className="text-2xl font-bold mb-4">Add Feedback: {selectedGame.title}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2">Feedback Type</label>
                  <select
                    value={feedbackForm.feedbackType}
                    onChange={(e) => setFeedbackForm({...feedbackForm, feedbackType: e.target.value as any})}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value="GENERAL">General</option>
                    <option value="BUG">Bug Report</option>
                    <option value="SUGGESTION">Suggestion</option>
                    <option value="PRAISE">Praise</option>
                    <option value="ACCESSIBILITY_ISSUE">Accessibility Issue</option>
                    <option value="CONTENT_ERROR">Content Error</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-2">Message</label>
                  <textarea
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                    className="w-full p-2 border rounded-lg h-32"
                    placeholder="Describe your feedback..."
                    required
                  />
                </div>

                {feedbackForm.feedbackType === 'BUG' && (
                  <div>
                    <label className="block font-medium mb-2">Issue Severity</label>
                    <select
                      value={feedbackForm.issueSeverity || ''}
                      onChange={(e) => setFeedbackForm({...feedbackForm, issueSeverity: e.target.value as any || null})}
                      className="w-full p-2 border rounded-lg"
                    >
                      <option value="">Select severity...</option>
                      <option value="CRITICAL">Critical (Blocks approval)</option>
                      <option value="MAJOR">Major</option>
                      <option value="MINOR">Minor</option>
                      <option value="TRIVIAL">Trivial</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSubmitFeedback}
                    disabled={!feedbackForm.message}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
