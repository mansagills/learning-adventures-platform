'use client';

import { useFormContext } from '../FormContext';
import RadioGroup from '../inputs/RadioGroup';
import MultiSelectCheckbox from '../inputs/MultiSelectCheckbox';

const courseLengthOptions = [
  {
    label: '1 Week Sprint',
    value: 'ONE_WEEK',
    icon: '⚡',
    description: 'Quick intensive focus on one skill',
  },
  {
    label: '2-3 Weeks',
    value: 'TWO_TO_THREE_WEEKS',
    icon: '📅',
    description: 'Short unit with depth',
  },
  {
    label: '4 Weeks (1 Month)',
    value: 'FOUR_WEEKS',
    icon: '📆',
    description: 'Standard unit length',
  },
  {
    label: '6-8 Weeks',
    value: 'SIX_TO_EIGHT_WEEKS',
    icon: '📖',
    description: 'Comprehensive topic exploration',
  },
  {
    label: 'Flexible/Ongoing',
    value: 'FLEXIBLE',
    icon: '🔄',
    description: 'Self-paced without time limit',
  },
];

const componentOptions = [
  {
    label: 'Interactive Games',
    value: 'GAMES',
    description: 'Educational games with learning objectives',
  },
  {
    label: 'Video Lessons',
    value: 'VIDEOS',
    description: 'Short instructional videos (5-15 minutes)',
  },
  {
    label: 'Reading Materials',
    value: 'READING',
    description: 'Articles, passages, digital books',
  },
  {
    label: 'Quizzes & Assessments',
    value: 'QUIZZES',
    description: 'Knowledge checks and practice tests',
  },
  {
    label: 'Hands-On Projects',
    value: 'PROJECTS',
    description: 'Creative projects and activities',
  },
  {
    label: 'Worksheets/Practice',
    value: 'WORKSHEETS',
    description: 'Printable practice exercises',
  },
  {
    label: 'Discussion Prompts',
    value: 'DISCUSSION',
    description: 'Questions for reflection or conversation',
  },
  {
    label: 'Real-World Challenges',
    value: 'CHALLENGES',
    description: 'Apply learning to real scenarios',
  },
];

const sessionDurationOptions = [
  {
    label: '10-15 Minutes',
    value: 'SHORT',
    icon: '⏱️',
    description: 'Quick daily sessions',
  },
  {
    label: '20-30 Minutes',
    value: 'MEDIUM',
    icon: '⏰',
    description: 'Standard lesson length',
  },
  {
    label: '45-60 Minutes',
    value: 'LONG',
    icon: '🕐',
    description: 'Deep dive sessions',
  },
  {
    label: 'Flexible',
    value: 'FLEXIBLE',
    icon: '🔀',
    description: 'Varies by activity',
  },
];

export default function Step6CourseFormat() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Course Format Preferences
        </h2>
        <p className="text-gray-600">How should this course be structured?</p>
      </div>

      {/* Course Length */}
      <RadioGroup
        label="Preferred Course Length"
        value={formData.courseLength || ''}
        onChange={(value) => updateField('courseLength', value)}
        options={courseLengthOptions}
        error={errors.courseLength}
        required
        layout="vertical"
      />

      {/* Course Components */}
      <MultiSelectCheckbox
        label="Include These Components"
        value={formData.courseComponents || []}
        onChange={(value) => updateField('courseComponents', value)}
        options={componentOptions}
        error={errors.courseComponents}
      />

      {/* Session Duration */}
      <RadioGroup
        label="Typical Session Duration"
        value={formData.sessionDuration || ''}
        onChange={(value) => updateField('sessionDuration', value)}
        options={sessionDurationOptions}
        error={errors.sessionDuration}
        required
        layout="horizontal"
      />

      {/* Help Text */}
      <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-2xl">🎯</div>
          <div>
            <h4 className="font-semibold text-ink-900 mb-1">
              Building the Perfect Course Structure
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Your preferences help us create a course that fits your schedule
              and learning style:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>
                • <strong>Shorter courses</strong> focus on specific skills with
                quick wins
              </li>
              <li>
                • <strong>Longer courses</strong> provide comprehensive coverage
                with review cycles
              </li>
              <li>
                • <strong>Session length</strong> determines activity complexity
                and pacing
              </li>
              <li>
                • <strong>Component mix</strong> creates variety and addresses
                multiple learning styles
              </li>
            </ul>
            <p className="text-sm text-gray-700 mt-2 italic">
              Tip: Most students benefit from a mix of games, videos, and
              hands-on projects for engagement and retention.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
