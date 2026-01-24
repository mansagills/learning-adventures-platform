'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import Icon from '@/components/Icon';

interface Child {
  id: string;
  displayName: string;
  username: string;
  gradeLevel: string;
  avatarId: string;
  createdAt: string;
  lastLoginAt: string | null;
}

const AVATARS = [
  { id: 'tiger', emoji: '🐯', name: 'Tiger' },
  { id: 'dragon', emoji: '🐉', name: 'Dragon' },
  { id: 'eagle', emoji: '🦅', name: 'Eagle' },
  { id: 'dolphin', emoji: '🐬', name: 'Dolphin' },
  { id: 'fox', emoji: '🦊', name: 'Fox' },
  { id: 'lion', emoji: '🦁', name: 'Lion' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'wolf', emoji: '🐺', name: 'Wolf' },
  { id: 'panda', emoji: '🐼', name: 'Panda' },
  { id: 'owl', emoji: '🦉', name: 'Owl' },
  { id: 'phoenix', emoji: '🔥', name: 'Phoenix' },
  { id: 'turtle', emoji: '🐢', name: 'Turtle' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin' },
  { id: 'koala', emoji: '🐨', name: 'Koala' },
  { id: 'cheetah', emoji: '🐆', name: 'Cheetah' },
  { id: 'rocket', emoji: '🚀', name: 'Rocket' },
];

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

function getAvatarEmoji(avatarId: string): string {
  return AVATARS.find(a => a.id === avatarId)?.emoji || '🐯';
}

function ManageChildrenPage() {
  const router = useRouter();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    gradeLevel: '3',
    avatarId: 'tiger',
    pin: '',
    confirmPin: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const res = await fetch('/api/parent/children');
      const data = await res.json();
      
      if (res.ok) {
        setChildren(data.children || []);
        setIsVerified(data.isVerifiedAdult || false);
      } else {
        setError(data.error || 'Failed to load children');
      }
    } catch (err) {
      setError('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      const res = await fetch('/api/parent/verify', { method: 'POST' });
      const data = await res.json();
      
      if (res.ok && data.verified) {
        setIsVerified(true);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Verification failed');
    }
  };

  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.pin !== formData.confirmPin) {
      setFormError('PINs do not match');
      return;
    }

    if (!/^\d{4}$/.test(formData.pin)) {
      setFormError('PIN must be exactly 4 digits');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/parent/children', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: formData.displayName,
          gradeLevel: formData.gradeLevel,
          avatarId: formData.avatarId,
          pin: formData.pin,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setShowAddModal(false);
        resetForm();
        fetchChildren();
      } else {
        setFormError(data.error || 'Failed to add child');
      }
    } catch (err) {
      setFormError('Failed to add child');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild) return;
    setFormError(null);

    // Only validate PIN if it's being changed
    if (formData.pin) {
      if (formData.pin !== formData.confirmPin) {
        setFormError('PINs do not match');
        return;
      }
      if (!/^\d{4}$/.test(formData.pin)) {
        setFormError('PIN must be exactly 4 digits');
        return;
      }
    }

    setSubmitting(true);

    try {
      const updateData: any = {
        displayName: formData.displayName,
        gradeLevel: formData.gradeLevel,
        avatarId: formData.avatarId,
      };

      if (formData.pin) {
        updateData.pin = formData.pin;
      }

      const res = await fetch(`/api/parent/children/${selectedChild.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        setShowEditModal(false);
        resetForm();
        setSelectedChild(null);
        fetchChildren();
      } else {
        setFormError(data.error || 'Failed to update child');
      }
    } catch (err) {
      setFormError('Failed to update child');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteChild = async () => {
    if (!selectedChild) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/parent/children/${selectedChild.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setShowDeleteModal(false);
        setSelectedChild(null);
        fetchChildren();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete child');
      }
    } catch (err) {
      setError('Failed to delete child');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (child: Child) => {
    setSelectedChild(child);
    setFormData({
      displayName: child.displayName,
      gradeLevel: child.gradeLevel,
      avatarId: child.avatarId,
      pin: '',
      confirmPin: '',
    });
    setFormError(null);
    setShowEditModal(true);
  };

  const openDeleteModal = (child: Child) => {
    setSelectedChild(child);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      displayName: '',
      gradeLevel: '3',
      avatarId: 'tiger',
      pin: '',
      confirmPin: '',
    });
    setFormError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-200 border-t-brand-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-brand-500 to-brand-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/parent/dashboard"
              className="flex items-center space-x-2 text-white/90 hover:text-white"
            >
              <Icon name="arrow-left" size={20} />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Manage Children</h1>
          <p className="text-brand-100 mt-2">
            Add and manage your children's learning accounts
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
          </div>
        )}

        {/* Verification Required */}
        {!isVerified && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name="info" size={24} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-2">
                  Parent Verification Required
                </h3>
                <p className="text-amber-800 mb-4">
                  To comply with COPPA regulations and protect children's privacy, 
                  we require parent verification before you can add children to your account.
                </p>
                <button
                  onClick={handleVerify}
                  className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Verify My Identity
                </button>
                <p className="text-xs text-amber-700 mt-2">
                  Note: This is a simplified verification for the demo. Production will use secure identity verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add Child Button */}
        {isVerified && (
          <div className="mb-6">
            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center space-x-2 px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              <Icon name="plus" size={20} />
              <span>Add Child</span>
            </button>
          </div>
        )}

        {/* Children List */}
        {children.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Children Added Yet</h3>
            <p className="text-gray-600 mb-6">
              {isVerified 
                ? "Add your first child to get started with their learning journey!"
                : "Complete parent verification above to add children."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children.map((child) => (
              <div
                key={child.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-3xl">
                      {getAvatarEmoji(child.avatarId)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{child.displayName}</h3>
                      <p className="text-sm text-gray-500">Grade {child.gradeLevel}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(child)}
                      className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Icon name="edit" size={18} />
                    </button>
                    <button
                      onClick={() => openDeleteModal(child)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Icon name="close" size={18} />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-500 mb-1">Login Username</p>
                  <p className="text-lg font-mono font-bold text-brand-600">{child.username}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Last login: {child.lastLoginAt 
                      ? new Date(child.lastLoginAt).toLocaleDateString() 
                      : 'Never'
                    }
                  </span>
                  <Link
                    href={`/parent/child/${child.id}`}
                    className="text-brand-600 hover:text-brand-700 font-medium"
                  >
                    View Progress →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Login Instructions */}
        {children.length > 0 && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              How Children Login
            </h3>
            <ol className="list-decimal list-inside text-blue-800 space-y-2">
              <li>Go to the <Link href="/child/login" className="underline font-medium">Child Login Page</Link></li>
              <li>Enter their username (shown on each card above)</li>
              <li>Enter their 4-digit PIN</li>
              <li>Start learning!</li>
            </ol>
          </div>
        )}
      </main>

      {/* Add Child Modal */}
      {showAddModal && (
        <Modal title="Add Child" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddChild} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Child's Name (or Nickname)
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="e.g., Alex"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level
              </label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose an Avatar
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarId: avatar.id })}
                    className={`w-10 h-10 text-2xl rounded-lg border-2 transition-all ${
                      formData.avatarId === avatar.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={avatar.name}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  4-Digit PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  value={formData.pin}
                  onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-center text-2xl tracking-widest"
                  placeholder="••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  pattern="\d{4}"
                  value={formData.confirmPin}
                  onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-center text-2xl tracking-widest"
                  placeholder="••••"
                />
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? 'Adding...' : 'Add Child'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Child Modal */}
      {showEditModal && selectedChild && (
        <Modal title={`Edit ${selectedChild.displayName}`} onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditChild} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Child's Name (or Nickname)
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level
              </label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              >
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar
              </label>
              <div className="grid grid-cols-8 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarId: avatar.id })}
                    className={`w-10 h-10 text-2xl rounded-lg border-2 transition-all ${
                      formData.avatarId === avatar.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    title={avatar.name}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-3">
                Leave PIN fields empty to keep the current PIN
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New PIN (optional)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-center text-2xl tracking-widest"
                    placeholder="••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={formData.confirmPin}
                    onChange={(e) => setFormData({ ...formData, confirmPin: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-center text-2xl tracking-widest"
                    placeholder="••••"
                  />
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {formError}
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedChild && (
        <Modal title="Delete Child Account" onClose={() => setShowDeleteModal(false)}>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="info" size={32} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Delete {selectedChild.displayName}'s Account?
            </h3>
            <p className="text-gray-600 mb-6">
              This will permanently delete their learning progress, achievements, and all associated data. 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteChild}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Simple Modal Component
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="close" size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ManageChildrenRoute() {
  return (
    <ProtectedRoute requiredRole="PARENT">
      <ManageChildrenPage />
    </ProtectedRoute>
  );
}
