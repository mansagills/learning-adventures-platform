'use client';

import { useFormContext } from '../FormContext';
import RadioGroup from '../inputs/RadioGroup';

const budgetTierOptions = [
  {
    label: 'Free/Low-Cost',
    value: 'FREE',
    icon: '🌱',
    description:
      'Use existing platform resources, minimal customization ($0-50)',
  },
  {
    label: 'Standard',
    value: 'STANDARD',
    icon: '⭐',
    description: 'Custom-designed course with AI + human review ($100-250)',
  },
  {
    label: 'Premium',
    value: 'PREMIUM',
    icon: '💎',
    description:
      'Fully custom with videos, advanced games, ongoing support ($300-500)',
  },
  {
    label: 'Not Sure / Flexible',
    value: 'FLEXIBLE',
    icon: '🤷',
    description: 'Open to recommendations based on needs',
  },
];

const reuseOptions = [
  {
    label: 'Yes - Make It Public',
    value: 'PUBLIC',
    icon: '🌍',
    description: 'Share with all users (may reduce your cost!)',
  },
  {
    label: 'Yes - Anonymously',
    value: 'ANONYMOUS',
    icon: '🎭',
    description: 'Share without student-specific details',
  },
  {
    label: 'No - Keep Private',
    value: 'PRIVATE',
    icon: '🔒',
    description: 'Exclusive access for my student(s) only',
  },
  {
    label: 'Undecided',
    value: 'UNDECIDED',
    icon: '❓',
    description: 'I need more information to decide',
  },
];

export default function Step9BudgetReusability() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Budget & Reusability
        </h2>
        <p className="text-gray-600">
          Help us understand your budget and sharing preferences
        </p>
      </div>

      {/* Budget Tier */}
      <RadioGroup
        label="Budget Range"
        value={formData.budgetTier || ''}
        onChange={(value) => updateField('budgetTier', value)}
        options={budgetTierOptions}
        error={errors.budgetTier}
        required
        layout="vertical"
      />

      {/* Reusability Permission */}
      <RadioGroup
        label="Can We Share This Course With Others?"
        value={formData.allowCourseReuse || ''}
        onChange={(value) => updateField('allowCourseReuse', value)}
        options={reuseOptions}
        error={errors.allowCourseReuse}
        required
        layout="vertical"
      />

      {/* Informational Boxes */}
      <div className="space-y-4">
        {/* Budget Breakdown */}
        <div className="p-4 bg-ocean-50 border border-ocean-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">💰</div>
            <div>
              <h4 className="font-semibold text-ink-900 mb-1">
                What's Included in Each Tier?
              </h4>
              <div className="space-y-3 mt-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Free/Low-Cost
                  </p>
                  <p className="text-xs text-gray-700">
                    Access to existing catalog games and lessons, curated
                    playlist for your needs
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Standard
                  </p>
                  <p className="text-xs text-gray-700">
                    AI-generated custom content, human educator review, 5-10
                    unique activities, progress tracking, email support
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Premium</p>
                  <p className="text-xs text-gray-700">
                    Everything in Standard PLUS custom videos, advanced
                    interactive games, printable materials, live tutoring
                    sessions (optional), priority support
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sharing Benefits */}
        <div className="p-4 bg-sunshine-50 border border-sunshine-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">🎁</div>
            <div>
              <h4 className="font-semibold text-ink-900 mb-1">
                Benefits of Sharing
              </h4>
              <p className="text-sm text-gray-700 mb-2">
                When you allow us to share your custom course with others:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>
                  • <strong>Reduced cost</strong> - Up to 50% off course
                  development
                </li>
                <li>
                  • <strong>Help other families</strong> - Your investment
                  benefits more students
                </li>
                <li>
                  • <strong>Build the library</strong> - Grow our platform's
                  resources
                </li>
                <li>
                  • <strong>Anonymous option</strong> - Share content without
                  personal details
                </li>
              </ul>
              <p className="text-sm text-gray-700 mt-2 italic">
                Note: We always remove student names, specific accommodations,
                and personal notes before making courses public.
              </p>
            </div>
          </div>
        </div>

        {/* Private Option */}
        {formData.allowCourseReuse === 'PRIVATE' && (
          <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-2xl">🔐</div>
              <div>
                <h4 className="font-semibold text-ink-900 mb-1">
                  Private Course Option
                </h4>
                <p className="text-sm text-gray-700">
                  We completely understand if you prefer to keep the course
                  private! Your custom content will be accessible only to you
                  and the students you designate. Full development cost will
                  apply.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Undecided Note */}
        {formData.allowCourseReuse === 'UNDECIDED' && (
          <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
            <div className="flex gap-3">
              <div className="flex-shrink-0 text-2xl">💭</div>
              <div>
                <h4 className="font-semibold text-ink-900 mb-1">
                  No Pressure to Decide Now
                </h4>
                <p className="text-sm text-gray-700">
                  You can make this decision later! We'll reach out after
                  reviewing your request to discuss options and pricing. You'll
                  have full transparency before any course development begins.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
