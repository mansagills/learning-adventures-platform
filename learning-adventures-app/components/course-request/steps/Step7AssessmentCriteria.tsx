'use client';

import { useFormContext } from '../FormContext';
import MultiSelectCheckbox from '../inputs/MultiSelectCheckbox';

const successIndicatorOptions = [
  {
    label: 'Mastery of Core Concepts',
    value: 'MASTERY',
    description: 'Can explain and apply key ideas independently'
  },
  {
    label: 'Improved Test Scores',
    value: 'TEST_SCORES',
    description: 'Higher scores on quizzes and assessments'
  },
  {
    label: 'Increased Confidence',
    value: 'CONFIDENCE',
    description: 'More willing to try challenging problems'
  },
  {
    label: 'Genuine Interest/Curiosity',
    value: 'INTEREST',
    description: 'Asking questions, exploring topics independently'
  },
  {
    label: 'Skill Application',
    value: 'APPLICATION',
    description: 'Using skills in real-world contexts'
  },
  {
    label: 'Reduced Frustration',
    value: 'LESS_FRUSTRATION',
    description: 'Less anxiety or struggle with the subject'
  },
  {
    label: 'Faster Work Completion',
    value: 'SPEED',
    description: 'More efficient at completing tasks'
  },
  {
    label: 'Better Homework Performance',
    value: 'HOMEWORK',
    description: 'Improved quality and completion of assignments'
  },
  {
    label: 'Peer Collaboration',
    value: 'COLLABORATION',
    description: 'Can help or work well with classmates'
  },
  {
    label: 'Growth Mindset',
    value: 'MINDSET',
    description: 'Sees mistakes as learning opportunities'
  },
];

const reportingPreferenceOptions = [
  {
    label: 'Weekly Progress Summary',
    value: 'WEEKLY_SUMMARY',
    description: 'Email update on activities completed and performance'
  },
  {
    label: 'End-of-Course Report',
    value: 'FINAL_REPORT',
    description: 'Comprehensive report when course is complete'
  },
  {
    label: 'Real-Time Dashboard Access',
    value: 'DASHBOARD',
    description: 'View progress anytime via parent/teacher portal'
  },
  {
    label: 'Milestone Alerts',
    value: 'MILESTONES',
    description: 'Notifications when key skills are mastered'
  },
  {
    label: 'Printable Certificates',
    value: 'CERTIFICATES',
    description: 'Achievement certificates to celebrate progress'
  },
  {
    label: 'Detailed Analytics',
    value: 'ANALYTICS',
    description: 'Data on time spent, accuracy, areas of strength/growth'
  },
  {
    label: 'Minimal Reporting',
    value: 'MINIMAL',
    description: 'Just final completion confirmation'
  },
];

export default function Step7AssessmentCriteria() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Assessment & Success Criteria
        </h2>
        <p className="text-gray-600">
          How will we know the course is working?
        </p>
      </div>

      {/* Success Indicators */}
      <MultiSelectCheckbox
        label="What Does Success Look Like?"
        value={formData.successIndicators || []}
        onChange={(value) => updateField('successIndicators', value)}
        options={successIndicatorOptions}
        error={errors.successIndicators}
      />

      {/* Reporting Preferences */}
      <MultiSelectCheckbox
        label="Progress Reporting Preferences"
        value={formData.reportingPreferences || []}
        onChange={(value) => updateField('reportingPreferences', value)}
        options={reportingPreferenceOptions}
        error={errors.reportingPreferences}
      />

      {/* Informational Boxes */}
      <div className="space-y-4">
        {/* Assessment Philosophy */}
        <div className="p-4 bg-ocean-50 border border-ocean-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">📊</div>
            <div>
              <h4 className="font-semibold text-ink-900 mb-1">
                Our Assessment Philosophy
              </h4>
              <p className="text-sm text-gray-700">
                We believe assessment should be low-stress and informative. Our courses use:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 mt-2">
                <li>• <strong>Formative checks</strong> - Quick knowledge checks during activities</li>
                <li>• <strong>Game-based assessment</strong> - Learning through play, not high-stakes tests</li>
                <li>• <strong>Progress tracking</strong> - See growth over time, not just final scores</li>
                <li>• <strong>Flexible retries</strong> - Students can review and retry until mastery</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">👁️</div>
            <div>
              <h4 className="font-semibold text-ink-900 mb-1">
                Who Sees Progress Data?
              </h4>
              <p className="text-sm text-gray-700">
                Only you (the requestor) and any admins you authorize will have access
                to detailed progress reports. Students see encouraging feedback and their
                own achievements, but detailed analytics are for adult stakeholders only.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
