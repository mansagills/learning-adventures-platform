'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  status:
    | 'NOT_TESTED'
    | 'IN_TESTING'
    | 'APPROVED'
    | 'REJECTED'
    | 'NEEDS_REVISION';
  catalogued: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    approvals: number;
    feedback: number;
  };
}

interface TestCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string[];
  difficulty: string;
  isPremium: boolean;
  estimatedMinutes: number;
  totalXP: number;
  stagingPath: string;
  lessonsData: any[];
  status:
    | 'NOT_TESTED'
    | 'IN_TESTING'
    | 'APPROVED'
    | 'REJECTED'
    | 'NEEDS_REVISION';
  promotedToCourseId: string | null;
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

interface CourseApproval {
  id: string;
  userName: string;
  decision: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  notes: string | null;
  curriculumQuality: boolean | null;
  contentAccuracy: boolean | null;
  technicalQuality: boolean | null;
  accessibilityCompliant: boolean | null;
  ageAppropriate: boolean | null;
  engagementLevel: number | null;
  createdAt: string;
}

interface Feedback {
  id: string;
  userName: string;
  feedbackType: string;
  message: string;
  issueSeverity: string | null;
  lessonIndex?: number | null;
  createdAt: string;
}

export default function TestingAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab management
  const [activeTab, setActiveTab] = useState<'games' | 'courses'>('games');

  // Games state
  const [games, setGames] = useState<TestGame[]>([]);
  const [selectedGame, setSelectedGame] = useState<TestGame | null>(null);
  const [gameApprovals, setGameApprovals] = useState<GameApproval[]>([]);
  const [gameFeedback, setGameFeedback] = useState<Feedback[]>([]);

  // Courses state
  const [courses, setCourses] = useState<TestCourse[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<TestCourse | null>(null);
  const [courseApprovals, setCourseApprovals] = useState<CourseApproval[]>([]);
  const [courseFeedback, setCourseFeedback] = useState<Feedback[]>([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Approval form state
  const [approvalForm, setApprovalForm] = useState({
    decision: 'APPROVE' as 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES',
    notes: '',
    educationalQuality: true,
    curriculumQuality: true,
    contentAccuracy: true,
    technicalQuality: true,
    accessibilityCompliant: true,
    ageAppropriate: true,
    engagementLevel: 5,
  });

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    feedbackType: 'GENERAL' as
      | 'BUG'
      | 'SUGGESTION'
      | 'PRAISE'
      | 'ACCESSIBILITY_ISSUE'
      | 'CONTENT_ERROR'
      | 'GENERAL',
    message: '',
    lessonIndex: null as number | null,
    issueSeverity: null as 'CRITICAL' | 'MAJOR' | 'MINOR' | 'TRIVIAL' | null,
  });

  // Handle URL params for tab and selection
  useEffect(() => {
    const tab = searchParams.get('tab');
    const selectId = searchParams.get('select');

    if (tab === 'courses') {
      setActiveTab('courses');
    }
  }, [searchParams]);

  // Fetch data
  useEffect(() => {
    fetchGames();
    fetchCourses();
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

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/test-courses');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
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

  const fetchCourseDetails = async (courseId: string) => {
    try {
      const res = await fetch(`/api/admin/test-courses/${courseId}`);
      const data = await res.json();
      setCourseApprovals(data.approvals || []);
      setCourseFeedback(data.feedback || []);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const handleSelectGame = (game: TestGame) => {
    setSelectedGame(game);
    setSelectedCourse(null);
    fetchGameDetails(game.id);
  };

  const handleSelectCourse = (course: TestCourse) => {
    setSelectedCourse(course);
    setSelectedGame(null);
    fetchCourseDetails(course.id);
  };

  const handleUpdateGameStatus = async (gameId: string, newStatus: string) => {
    try {
      await fetch(`/api/admin/test-games/${gameId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchGames();
      if (selectedGame?.id === gameId) {
        setSelectedGame({ ...selectedGame, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleUpdateCourseStatus = async (
    courseId: string,
    newStatus: string
  ) => {
    try {
      await fetch(`/api/admin/test-courses/${courseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchCourses();
      if (selectedCourse?.id === courseId) {
        setSelectedCourse({ ...selectedCourse, status: newStatus as any });
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleSubmitGameApproval = async () => {
    if (!selectedGame) return;

    try {
      await fetch(`/api/admin/test-games/${selectedGame.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: approvalForm.decision,
          notes: approvalForm.notes,
          educationalQuality: approvalForm.educationalQuality,
          technicalQuality: approvalForm.technicalQuality,
          accessibilityCompliant: approvalForm.accessibilityCompliant,
          ageAppropriate: approvalForm.ageAppropriate,
          engagementLevel: approvalForm.engagementLevel,
        }),
      });

      setShowApprovalModal(false);
      fetchGames();
      fetchGameDetails(selectedGame.id);
      resetApprovalForm();
    } catch (error) {
      console.error('Error submitting approval:', error);
    }
  };

  const handleSubmitCourseApproval = async () => {
    if (!selectedCourse) return;

    try {
      await fetch(`/api/admin/test-courses/${selectedCourse.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: approvalForm.decision,
          notes: approvalForm.notes,
          curriculumQuality: approvalForm.curriculumQuality,
          contentAccuracy: approvalForm.contentAccuracy,
          technicalQuality: approvalForm.technicalQuality,
          accessibilityCompliant: approvalForm.accessibilityCompliant,
          ageAppropriate: approvalForm.ageAppropriate,
          engagementLevel: approvalForm.engagementLevel,
        }),
      });

      setShowApprovalModal(false);
      fetchCourses();
      fetchCourseDetails(selectedCourse.id);
      resetApprovalForm();
    } catch (error) {
      console.error('Error submitting approval:', error);
    }
  };

  const handleSubmitFeedback = async () => {
    const isGame = activeTab === 'games';
    const id = isGame ? selectedGame?.id : selectedCourse?.id;
    if (!id) return;

    try {
      const endpoint = isGame
        ? `/api/admin/test-games/${id}/feedback`
        : `/api/admin/test-courses/${id}/feedback`;

      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackForm),
      });

      setShowFeedbackModal(false);
      if (isGame) {
        fetchGameDetails(id);
      } else {
        fetchCourseDetails(id);
      }
      resetFeedbackForm();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handlePromoteGame = async (gameId: string) => {
    if (
      !confirm(
        'Promote this game to the public catalog? This will make it visible to all users.'
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/test-games/${gameId}/promote`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        alert('Game promoted to catalog successfully!');
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

  const handlePromoteCourse = async (courseId: string) => {
    if (
      !confirm(
        'Promote this course to production? This will make it available to all users.'
      )
    )
      return;

    try {
      const res = await fetch(`/api/admin/test-courses/${courseId}/promote`, {
        method: 'POST',
      });
      const data = await res.json();

      if (data.success) {
        alert('Course promoted to production successfully!');
        fetchCourses();
        if (selectedCourse?.id === courseId) {
          setSelectedCourse({
            ...selectedCourse,
            promotedToCourseId: data.courseId,
          });
        }
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error promoting course:', error);
      alert('Failed to promote course to production');
    }
  };

  const resetApprovalForm = () => {
    setApprovalForm({
      decision: 'APPROVE',
      notes: '',
      educationalQuality: true,
      curriculumQuality: true,
      contentAccuracy: true,
      technicalQuality: true,
      accessibilityCompliant: true,
      ageAppropriate: true,
      engagementLevel: 5,
    });
  };

  const resetFeedbackForm = () => {
    setFeedbackForm({
      feedbackType: 'GENERAL',
      message: '',
      lessonIndex: null,
      issueSeverity: null,
    });
  };

  const filteredGames =
    filter === 'ALL' ? games : games.filter((g) => g.status === filter);

  const filteredCourses =
    filter === 'ALL' ? courses : courses.filter((c) => c.status === filter);

  const statusColors: Record<string, string> = {
    NOT_TESTED: 'bg-gray-100 text-gray-800',
    IN_TESTING: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    NEEDS_REVISION: 'bg-yellow-100 text-yellow-800',
  };

  const decisionColors: Record<string, string> = {
    APPROVE: 'text-green-600',
    REJECT: 'text-red-600',
    REQUEST_CHANGES: 'text-yellow-600',
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Content Testing & Approval
          </h1>
          <p className="text-gray-600">
            Review, test, and approve games and courses before production
          </p>
        </div>

        {/* Main Tabs: Games / Courses */}
        <div className="mb-6 flex gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setActiveTab('games');
              setSelectedCourse(null);
            }}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'games'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Games ({games.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('courses');
              setSelectedGame(null);
            }}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'courses'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Courses ({courses.length})
          </button>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            'ALL',
            'NOT_TESTED',
            'IN_TESTING',
            'APPROVED',
            'NEEDS_REVISION',
            'REJECTED',
          ].map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setFilter(statusOption)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === statusOption
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {statusOption.replace('_', ' ')}
              <span className="ml-2 text-sm">
                (
                {statusOption === 'ALL'
                  ? activeTab === 'games'
                    ? games.length
                    : courses.length
                  : activeTab === 'games'
                    ? games.filter((g) => g.status === statusOption).length
                    : courses.filter((c) => c.status === statusOption).length}
                )
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">
              {activeTab === 'games' ? 'Test Games' : 'Test Courses'}
            </h2>
            <div className="space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
              {activeTab === 'games'
                ? filteredGames.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => handleSelectGame(game)}
                      className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                        selectedGame?.id === game.id
                          ? 'border-indigo-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">
                          {game.title}
                        </h3>
                        {game.catalogued && (
                          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                            Published
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {game.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${statusColors[game.status]}`}
                        >
                          {game.status.replace('_', ' ')}
                        </span>
                        <div className="text-xs text-gray-500">
                          {game._count.feedback} feedback |{' '}
                          {game._count.approvals} reviews
                        </div>
                      </div>
                    </div>
                  ))
                : filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleSelectCourse(course)}
                      className={`p-4 bg-white rounded-lg border-2 cursor-pointer transition-all ${
                        selectedCourse?.id === course.id
                          ? 'border-indigo-500 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">
                          {course.title}
                        </h3>
                        <div className="flex gap-1">
                          {course.isPremium && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Premium
                            </span>
                          )}
                          {course.promotedToCourseId && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              Published
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {course.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs px-2 py-1 rounded font-medium ${statusColors[course.status]}`}
                        >
                          {course.status.replace('_', ' ')}
                        </span>
                        <div className="text-xs text-gray-500">
                          {course.lessonsData?.length || 0} lessons |{' '}
                          {course._count.feedback} feedback
                        </div>
                      </div>
                    </div>
                  ))}
              {((activeTab === 'games' && filteredGames.length === 0) ||
                (activeTab === 'courses' && filteredCourses.length === 0)) && (
                <p className="text-center text-gray-500 py-8">
                  No items found with this filter
                </p>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2">
            {activeTab === 'games' && selectedGame ? (
              <GameDetailsPanel
                game={selectedGame}
                approvals={gameApprovals}
                feedback={gameFeedback}
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                onApprove={() => setShowApprovalModal(true)}
                onFeedback={() => setShowFeedbackModal(true)}
                onPromote={() => handlePromoteGame(selectedGame.id)}
                onStatusChange={(status) =>
                  handleUpdateGameStatus(selectedGame.id, status)
                }
                statusColors={statusColors}
                decisionColors={decisionColors}
              />
            ) : activeTab === 'courses' && selectedCourse ? (
              <CourseDetailsPanel
                course={selectedCourse}
                approvals={courseApprovals}
                feedback={courseFeedback}
                showPreview={showPreview}
                setShowPreview={setShowPreview}
                onApprove={() => setShowApprovalModal(true)}
                onFeedback={() => setShowFeedbackModal(true)}
                onPromote={() => handlePromoteCourse(selectedCourse.id)}
                onStatusChange={(status) =>
                  handleUpdateCourseStatus(selectedCourse.id, status)
                }
                statusColors={statusColors}
                decisionColors={decisionColors}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
                <div className="text-6xl mb-4">
                  {activeTab === 'games' ? '🎮' : '📚'}
                </div>
                <p className="text-xl">
                  Select a {activeTab === 'games' ? 'game' : 'course'} to view
                  details and approve
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Approval Modal */}
        {showApprovalModal && (selectedGame || selectedCourse) && (
          <ApprovalModal
            title={selectedGame?.title || selectedCourse?.title || ''}
            isGame={activeTab === 'games'}
            form={approvalForm}
            setForm={setApprovalForm}
            onSubmit={
              activeTab === 'games'
                ? handleSubmitGameApproval
                : handleSubmitCourseApproval
            }
            onClose={() => setShowApprovalModal(false)}
          />
        )}

        {/* Feedback Modal */}
        {showFeedbackModal && (selectedGame || selectedCourse) && (
          <FeedbackModal
            title={selectedGame?.title || selectedCourse?.title || ''}
            isGame={activeTab === 'games'}
            lessonsCount={selectedCourse?.lessonsData?.length}
            form={feedbackForm}
            setForm={setFeedbackForm}
            onSubmit={handleSubmitFeedback}
            onClose={() => setShowFeedbackModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Game Details Panel Component
function GameDetailsPanel({
  game,
  approvals,
  feedback,
  showPreview,
  setShowPreview,
  onApprove,
  onFeedback,
  onPromote,
  onStatusChange,
  statusColors,
  decisionColors,
}: {
  game: TestGame;
  approvals: GameApproval[];
  feedback: Feedback[];
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  onApprove: () => void;
  onFeedback: () => void;
  onPromote: () => void;
  onStatusChange: (status: string) => void;
  statusColors: Record<string, string>;
  decisionColors: Record<string, string>;
}) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{game.title}</h2>
            <span
              className={`inline-block mt-2 text-sm px-3 py-1 rounded-full font-medium ${statusColors[game.status]}`}
            >
              {game.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/staging/games/${game.gameId}`}
              target="_blank"
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium"
            >
              Open Staging URL
            </Link>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {showPreview ? 'Hide' : 'Preview'} Game
            </button>
          </div>
        </div>

        {showPreview && (
          <div className="mb-4 border-4 border-indigo-200 rounded-lg overflow-hidden">
            <iframe
              src={game.filePath}
              className="w-full h-[600px]"
              title={game.title}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <strong>Category:</strong> {game.category}
          </div>
          <div>
            <strong>Type:</strong> {game.type}
          </div>
          <div>
            <strong>Grade Level:</strong> {game.gradeLevel.join(', ')}
          </div>
          <div>
            <strong>Difficulty:</strong> {game.difficulty}
          </div>
          <div>
            <strong>Time:</strong> {game.estimatedTime}
          </div>
          <div>
            <strong>Skills:</strong> {game.skills.join(', ')}
          </div>
        </div>

        <p className="text-gray-600 mb-4">{game.description}</p>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Approve/Review
          </button>
          <button
            onClick={onFeedback}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add Feedback
          </button>
          {game.status === 'APPROVED' && !game.catalogued && (
            <button
              onClick={onPromote}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Promote to Catalog
            </button>
          )}
          <select
            value={game.status}
            onChange={(e) => onStatusChange(e.target.value)}
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
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Approval History ({approvals.length})
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">{approval.userName}</span>
                <span
                  className={`font-bold ${decisionColors[approval.decision]}`}
                >
                  {approval.decision.replace('_', ' ')}
                </span>
              </div>
              {approval.notes && (
                <p className="text-sm text-gray-700 mb-2">{approval.notes}</p>
              )}
              <div className="text-xs text-gray-500 grid grid-cols-2 gap-2">
                {approval.educationalQuality !== null && (
                  <div>
                    Educational: {approval.educationalQuality ? '✅' : '❌'}
                  </div>
                )}
                {approval.technicalQuality !== null && (
                  <div>
                    Technical: {approval.technicalQuality ? '✅' : '❌'}
                  </div>
                )}
                {approval.accessibilityCompliant !== null && (
                  <div>
                    Accessibility:{' '}
                    {approval.accessibilityCompliant ? '✅' : '❌'}
                  </div>
                )}
                {approval.ageAppropriate !== null && (
                  <div>
                    Age Appropriate: {approval.ageAppropriate ? '✅' : '❌'}
                  </div>
                )}
                {approval.engagementLevel && (
                  <div>Engagement: {'⭐'.repeat(approval.engagementLevel)}</div>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(approval.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {approvals.length === 0 && (
            <p className="text-gray-500 text-sm">No approvals yet</p>
          )}
        </div>
      </div>

      {/* Feedback */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Feedback & Notes ({feedback.length})
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">{item.userName}</span>
                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                  {item.feedbackType}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{item.message}</p>
              {item.issueSeverity && (
                <span className="text-xs text-red-600 font-medium">
                  Severity: {item.issueSeverity}
                </span>
              )}
              <div className="text-xs text-gray-400 mt-2">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {feedback.length === 0 && (
            <p className="text-gray-500 text-sm">No feedback yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Course Details Panel Component
function CourseDetailsPanel({
  course,
  approvals,
  feedback,
  showPreview,
  setShowPreview,
  onApprove,
  onFeedback,
  onPromote,
  onStatusChange,
  statusColors,
  decisionColors,
}: {
  course: TestCourse;
  approvals: CourseApproval[];
  feedback: Feedback[];
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
  onApprove: () => void;
  onFeedback: () => void;
  onPromote: () => void;
  onStatusChange: (status: string) => void;
  statusColors: Record<string, string>;
  decisionColors: Record<string, string>;
}) {
  const [previewLessonIndex, setPreviewLessonIndex] = useState(0);
  const lessons = course.lessonsData || [];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{course.title}</h2>
            <div className="flex gap-2 mt-2">
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium ${statusColors[course.status]}`}
              >
                {course.status.replace('_', ' ')}
              </span>
              {course.isPremium && (
                <span className="text-sm px-3 py-1 rounded-full font-medium bg-yellow-100 text-yellow-800">
                  Premium
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/staging/courses/${course.slug}`}
              target="_blank"
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium"
            >
              Open Staging URL
            </Link>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {showPreview ? 'Hide' : 'Preview'} Course
            </button>
          </div>
        </div>

        {showPreview && lessons.length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
              {lessons.map((lesson: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setPreviewLessonIndex(index)}
                  className={`px-3 py-1 rounded-lg text-sm whitespace-nowrap ${
                    previewLessonIndex === index
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Lesson {lesson.order}: {lesson.title}
                </button>
              ))}
            </div>
            <div className="border-4 border-indigo-200 rounded-lg overflow-hidden">
              <iframe
                src={lessons[previewLessonIndex]?.file}
                className="w-full h-[500px]"
                title={lessons[previewLessonIndex]?.title}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <strong>Subject:</strong> {course.subject}
          </div>
          <div>
            <strong>Grade Level:</strong> {course.gradeLevel.join(', ')}
          </div>
          <div>
            <strong>Difficulty:</strong> {course.difficulty}
          </div>
          <div>
            <strong>Duration:</strong> {course.estimatedMinutes} mins
          </div>
          <div>
            <strong>Total XP:</strong> {course.totalXP}
          </div>
          <div>
            <strong>Lessons:</strong> {lessons.length}
          </div>
        </div>

        <p className="text-gray-600 mb-4">{course.description}</p>

        {/* Lessons List */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Lessons Overview</h4>
          <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
            {lessons.map((lesson: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between py-1 text-sm"
              >
                <span>
                  {lesson.order}. {lesson.title}
                </span>
                <span className="text-gray-500">
                  {lesson.type} • {lesson.duration}min • {lesson.xpReward}XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={onApprove}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Approve/Review
          </button>
          <button
            onClick={onFeedback}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add Feedback
          </button>
          {course.status === 'APPROVED' && !course.promotedToCourseId && (
            <button
              onClick={onPromote}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Promote to Production
            </button>
          )}
          <select
            value={course.status}
            onChange={(e) => onStatusChange(e.target.value)}
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
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Approval History ({approvals.length})
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">{approval.userName}</span>
                <span
                  className={`font-bold ${decisionColors[approval.decision]}`}
                >
                  {approval.decision.replace('_', ' ')}
                </span>
              </div>
              {approval.notes && (
                <p className="text-sm text-gray-700 mb-2">{approval.notes}</p>
              )}
              <div className="text-xs text-gray-500 grid grid-cols-2 gap-2">
                {approval.curriculumQuality !== null && (
                  <div>
                    Curriculum: {approval.curriculumQuality ? '✅' : '❌'}
                  </div>
                )}
                {approval.contentAccuracy !== null && (
                  <div>Accuracy: {approval.contentAccuracy ? '✅' : '❌'}</div>
                )}
                {approval.technicalQuality !== null && (
                  <div>
                    Technical: {approval.technicalQuality ? '✅' : '❌'}
                  </div>
                )}
                {approval.accessibilityCompliant !== null && (
                  <div>
                    Accessibility:{' '}
                    {approval.accessibilityCompliant ? '✅' : '❌'}
                  </div>
                )}
                {approval.ageAppropriate !== null && (
                  <div>
                    Age Appropriate: {approval.ageAppropriate ? '✅' : '❌'}
                  </div>
                )}
                {approval.engagementLevel && (
                  <div>Engagement: {'⭐'.repeat(approval.engagementLevel)}</div>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-2">
                {new Date(approval.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {approvals.length === 0 && (
            <p className="text-gray-500 text-sm">No approvals yet</p>
          )}
        </div>
      </div>

      {/* Feedback */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Feedback & Notes ({feedback.length})
        </h3>
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold">{item.userName}</span>
                <div className="flex gap-2">
                  {item.lessonIndex !== null &&
                    item.lessonIndex !== undefined && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Lesson {item.lessonIndex + 1}
                      </span>
                    )}
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
                    {item.feedbackType}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{item.message}</p>
              {item.issueSeverity && (
                <span className="text-xs text-red-600 font-medium">
                  Severity: {item.issueSeverity}
                </span>
              )}
              <div className="text-xs text-gray-400 mt-2">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
          {feedback.length === 0 && (
            <p className="text-gray-500 text-sm">No feedback yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Approval Modal Component
function ApprovalModal({
  title,
  isGame,
  form,
  setForm,
  onSubmit,
  onClose,
}: {
  title: string;
  isGame: boolean;
  form: any;
  setForm: (form: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Review: {title}</h3>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Decision</label>
            <select
              value={form.decision}
              onChange={(e) => setForm({ ...form, decision: e.target.value })}
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
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full p-2 border rounded-lg h-24"
              placeholder="Add notes about your decision..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {isGame ? (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.educationalQuality}
                  onChange={(e) =>
                    setForm({ ...form, educationalQuality: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                Educational Quality
              </label>
            ) : (
              <>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.curriculumQuality}
                    onChange={(e) =>
                      setForm({ ...form, curriculumQuality: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  Curriculum Quality
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.contentAccuracy}
                    onChange={(e) =>
                      setForm({ ...form, contentAccuracy: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  Content Accuracy
                </label>
              </>
            )}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.technicalQuality}
                onChange={(e) =>
                  setForm({ ...form, technicalQuality: e.target.checked })
                }
                className="w-4 h-4"
              />
              Technical Quality
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.accessibilityCompliant}
                onChange={(e) =>
                  setForm({ ...form, accessibilityCompliant: e.target.checked })
                }
                className="w-4 h-4"
              />
              Accessibility Compliant
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.ageAppropriate}
                onChange={(e) =>
                  setForm({ ...form, ageAppropriate: e.target.checked })
                }
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
              value={form.engagementLevel}
              onChange={(e) =>
                setForm({ ...form, engagementLevel: parseInt(e.target.value) })
              }
              className="w-full"
            />
            <div className="text-center text-2xl">
              {'⭐'.repeat(form.engagementLevel)}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onSubmit}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Submit Review
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feedback Modal Component
function FeedbackModal({
  title,
  isGame,
  lessonsCount,
  form,
  setForm,
  onSubmit,
  onClose,
}: {
  title: string;
  isGame: boolean;
  lessonsCount?: number;
  form: any;
  setForm: (form: any) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h3 className="text-2xl font-bold mb-4">Add Feedback: {title}</h3>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-2">Feedback Type</label>
            <select
              value={form.feedbackType}
              onChange={(e) =>
                setForm({ ...form, feedbackType: e.target.value })
              }
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

          {!isGame && lessonsCount && lessonsCount > 0 && (
            <div>
              <label className="block font-medium mb-2">
                Specific Lesson (Optional)
              </label>
              <select
                value={form.lessonIndex ?? ''}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lessonIndex: e.target.value
                      ? parseInt(e.target.value)
                      : null,
                  })
                }
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All lessons / General</option>
                {Array.from({ length: lessonsCount }, (_, i) => (
                  <option key={i} value={i}>
                    Lesson {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-medium mb-2">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full p-2 border rounded-lg h-32"
              placeholder="Describe your feedback..."
              required
            />
          </div>

          {form.feedbackType === 'BUG' && (
            <div>
              <label className="block font-medium mb-2">Issue Severity</label>
              <select
                value={form.issueSeverity || ''}
                onChange={(e) =>
                  setForm({ ...form, issueSeverity: e.target.value || null })
                }
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
              onClick={onSubmit}
              disabled={!form.message}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Submit Feedback
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
