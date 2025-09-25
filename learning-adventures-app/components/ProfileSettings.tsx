'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Button from './Button';
import Icon from './Icon';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileData {
  name: string;
  email: string;
  gradeLevel?: string;
  subjects: string[];
  role: string;
}

const GRADE_LEVELS = [
  { value: 'K', label: 'Kindergarten' },
  { value: '1', label: '1st Grade' },
  { value: '2', label: '2nd Grade' },
  { value: '3', label: '3rd Grade' },
  { value: '4', label: '4th Grade' },
  { value: '5', label: '5th Grade' },
];

const SUBJECTS = [
  { value: 'math', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'english', label: 'English Language Arts' },
  { value: 'history', label: 'History & Social Studies' },
  { value: 'interdisciplinary', label: 'Interdisciplinary Projects' },
];

export default function ProfileSettings({ isOpen, onClose }: ProfileSettingsProps) {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    gradeLevel: '',
    subjects: [],
    role: 'STUDENT',
  });

  // Load current user data when modal opens
  useEffect(() => {
    if (isOpen && session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        gradeLevel: session.user.gradeLevel || '',
        subjects: session.user.subjects || [],
        role: session.user.role || 'STUDENT',
      });
    }
  }, [isOpen, session]);

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSubjectToggle = (subject: string) => {
    setProfileData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profileData.name,
          gradeLevel: profileData.gradeLevel,
          subjects: profileData.subjects,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update the session with new data
      await update({
        name: profileData.name,
        gradeLevel: profileData.gradeLevel,
        subjects: profileData.subjects,
      });

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Profile Settings"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={profileData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={profileData.email}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-ink-500 cursor-not-allowed"
            readOnly
          />
          <p className="text-xs text-ink-500 mt-1">Email cannot be changed</p>
        </div>

        {/* Role (read-only) */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-ink-700 mb-1">
            Account Type
          </label>
          <input
            type="text"
            id="role"
            value={profileData.role?.charAt(0) + profileData.role?.slice(1).toLowerCase()}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-ink-500 cursor-not-allowed"
            readOnly
          />
        </div>

        {/* Grade Level (for students) */}
        {profileData.role === 'STUDENT' && (
          <div>
            <label htmlFor="gradeLevel" className="block text-sm font-medium text-ink-700 mb-1">
              Grade Level
            </label>
            <select
              id="gradeLevel"
              value={profileData.gradeLevel}
              onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">Select Grade Level</option>
              {GRADE_LEVELS.map((grade) => (
                <option key={grade.value} value={grade.value}>
                  {grade.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Subject Interests */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">
            Subject Interests
          </label>
          <div className="grid grid-cols-1 gap-2">
            {SUBJECTS.map((subject) => (
              <label key={subject.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={profileData.subjects.includes(subject.value)}
                  onChange={() => handleSubjectToggle(subject.value)}
                  className="rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="ml-2 text-sm text-ink-700">{subject.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <div className="flex items-center">
              <Icon name="alert-circle" size={16} className="text-red-500 mr-2" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <div className="flex items-center">
              <Icon name="check-circle" size={16} className="text-green-500 mr-2" />
              <p className="text-sm text-green-600">{success}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSaving}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            className="flex-1 flex items-center justify-center"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}