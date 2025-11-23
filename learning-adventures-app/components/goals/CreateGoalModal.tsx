'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Icon from '../Icon';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (goalData: {
    title: string;
    description?: string;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    category?: string;
    targetType: string;
    targetValue: number;
    unit: string;
    deadline?: string;
    icon?: string;
    color?: string;
    priority?: number;
  }) => Promise<void>;
}

const goalTypes = [
  { value: 'DAILY', label: 'Daily', icon: '📅', description: 'Resets every day' },
  { value: 'WEEKLY', label: 'Weekly', icon: '📆', description: 'Resets every week' },
  { value: 'MONTHLY', label: 'Monthly', icon: '🗓️', description: 'Resets every month' },
  { value: 'CUSTOM', label: 'Custom', icon: '🎯', description: 'Set your own deadline' }
];

const targetTypes = [
  { value: 'ADVENTURES_COMPLETE', label: 'Complete Adventures', unit: 'adventures', icon: '🎮' },
  { value: 'XP_EARN', label: 'Earn XP', unit: 'XP', icon: '⭐' },
  { value: 'TIME_SPEND', label: 'Learning Time', unit: 'minutes', icon: '⏱️' },
  { value: 'SKILLS_MASTER', label: 'Master Skills', unit: 'skills', icon: '🎓' },
  { value: 'STREAK_MAINTAIN', label: 'Maintain Streak', unit: 'days', icon: '🔥' },
  { value: 'SUBJECT_COMPLETE', label: 'Subject Adventures', unit: 'adventures', icon: '📚' }
];

const subjects = [
  { value: 'math', label: 'Math', icon: '🔢' },
  { value: 'science', label: 'Science', icon: '🔬' },
  { value: 'english', label: 'English', icon: '📚' },
  { value: 'history', label: 'History', icon: '🏛️' },
  { value: 'interdisciplinary', label: 'Interdisciplinary', icon: '🌐' }
];

const colors = [
  '#3b82f6', // blue
  '#10b981', // green
  '#8b5cf6', // purple
  '#f97316', // orange
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f59e0b', // amber
  '#ef4444'  // red
];

export default function CreateGoalModal({ isOpen, onClose, onCreate }: CreateGoalModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'DAILY' as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM',
    category: '',
    targetType: 'ADVENTURES_COMPLETE',
    targetValue: 3,
    unit: 'adventures',
    deadline: '',
    icon: '🎯',
    color: colors[0],
    priority: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please enter a goal title');
      return;
    }

    if (formData.targetValue <= 0) {
      setError('Target value must be greater than 0');
      return;
    }

    if (formData.type === 'CUSTOM' && !formData.deadline) {
      setError('Please set a deadline for custom goals');
      return;
    }

    setLoading(true);
    try {
      await onCreate({
        title: formData.title,
        description: formData.description || undefined,
        type: formData.type,
        category: formData.category || undefined,
        targetType: formData.targetType,
        targetValue: formData.targetValue,
        unit: formData.unit,
        deadline: formData.deadline || undefined,
        icon: formData.icon,
        color: formData.color,
        priority: formData.priority
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'DAILY',
        category: '',
        targetType: 'ADVENTURES_COMPLETE',
        targetValue: 3,
        unit: 'adventures',
        deadline: '',
        icon: '🎯',
        color: colors[0],
        priority: 0
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  const handleTargetTypeChange = (targetType: string) => {
    const selected = targetTypes.find(t => t.value === targetType);
    setFormData({
      ...formData,
      targetType,
      unit: selected?.unit || 'units',
      icon: selected?.icon || '🎯'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-ink-800">Create New Goal</h2>
            <p className="text-sm text-gray-600 mt-1">Set a learning goal to track your progress</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <Icon name="close" size={24} className="text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <Icon name="alert" size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Goal Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Goal Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="e.g., Complete 3 math adventures"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="Add any additional details..."
              rows={2}
            />
          </div>

          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Goal Type *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {goalTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value as any })}
                  className={cn(
                    'p-4 border-2 rounded-lg text-center transition-all',
                    formData.type === type.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{type.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What do you want to achieve? *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {targetTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTargetTypeChange(type.value)}
                  className={cn(
                    'p-3 border-2 rounded-lg text-left transition-all',
                    formData.targetType === type.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{type.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{type.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Value *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 0 })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                min="1"
                required
              />
              <span className="text-gray-700 font-medium">{formData.unit}</span>
            </div>
          </div>

          {/* Subject (if SUBJECT_COMPLETE) */}
          {formData.targetType === 'SUBJECT_COMPLETE' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Subject *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {subjects.map((subject) => (
                  <button
                    key={subject.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: subject.value })}
                    className={cn(
                      'p-3 border-2 rounded-lg text-center transition-all',
                      formData.category === subject.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="text-2xl mb-1">{subject.icon}</div>
                    <div className="text-xs font-medium text-gray-900">{subject.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Deadline */}
          {formData.type === 'CUSTOM' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline *
              </label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          )}

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Goal Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 transition-all',
                    formData.color === color ? 'border-gray-900 scale-110' : 'border-transparent'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            >
              <option value="0">Normal</option>
              <option value="1">High</option>
              <option value="2">Urgent</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium flex items-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Icon name="check" size={20} />
                  <span>Create Goal</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
