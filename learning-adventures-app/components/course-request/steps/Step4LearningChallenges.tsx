'use client';

import { useFormContext } from '../FormContext';
import MultiSelectCheckbox from '../inputs/MultiSelectCheckbox';
import TextAreaField from '../inputs/TextAreaField';

const challengeOptions = [
  {
    label: 'Difficulty Focusing/Attention',
    value: 'ATTENTION',
    description: 'Short attention span, easily distracted'
  },
  {
    label: 'Reading Struggles',
    value: 'READING',
    description: 'Difficulty with decoding, comprehension, or fluency'
  },
  {
    label: 'Math Anxiety',
    value: 'MATH_ANXIETY',
    description: 'Fear or stress around math concepts'
  },
  {
    label: 'Writing Difficulties',
    value: 'WRITING',
    description: 'Challenges with written expression or organization'
  },
  {
    label: 'Processing Speed',
    value: 'PROCESSING_SPEED',
    description: 'Needs more time to process information'
  },
  {
    label: 'Memory Challenges',
    value: 'MEMORY',
    description: 'Difficulty retaining or recalling information'
  },
  {
    label: 'Executive Function',
    value: 'EXECUTIVE_FUNCTION',
    description: 'Planning, organization, time management struggles'
  },
  {
    label: 'Motivation/Engagement',
    value: 'MOTIVATION',
    description: 'Low interest in learning or school resistance'
  },
  {
    label: 'Test Anxiety',
    value: 'TEST_ANXIETY',
    description: 'Stress or poor performance on assessments'
  },
  {
    label: 'Social-Emotional Challenges',
    value: 'SOCIAL_EMOTIONAL',
    description: 'Anxiety, self-confidence, peer interaction issues'
  },
  {
    label: 'Perfectionism',
    value: 'PERFECTIONISM',
    description: 'Fear of mistakes, difficulty starting tasks'
  },
  {
    label: 'No Significant Challenges',
    value: 'NONE',
    description: 'Student is progressing well overall'
  },
];

export default function Step4LearningChallenges() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Learning Challenges
        </h2>
        <p className="text-gray-600">
          Help us understand any learning challenges so we can provide better support
        </p>
      </div>

      {/* Challenge Selection */}
      <MultiSelectCheckbox
        label="Select Any Challenges That Apply"
        value={formData.learningChallenges || []}
        onChange={(value) => updateField('learningChallenges', value)}
        options={challengeOptions}
        error={errors.learningChallenges}
      />

      {/* Observational Notes */}
      {formData.learningChallenges && formData.learningChallenges.length > 0 &&
       !formData.learningChallenges.includes('NONE') && (
        <TextAreaField
          label="What Have You Observed?"
          value={formData.challengeObservations || ''}
          onChange={(value) => updateField('challengeObservations', value)}
          placeholder="Share specific observations or patterns you've noticed... For example: 'Struggles to remember multiplication facts even after practice' or 'Gets frustrated when reading aloud but understands when listening to stories'"
          helpText="Your insights help us design strategies that work for this learner"
          rows={5}
          maxLength={1000}
          showCharacterCount
        />
      )}

      {/* Informational Boxes */}
      <div className="space-y-4">
        {/* Positive Note */}
        <div className="p-4 bg-ocean-50 border border-ocean-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">💙</div>
            <div>
              <h4 className="font-semibold text-ink-900 mb-1">
                Challenges Are Learning Opportunities
              </h4>
              <p className="text-sm text-gray-700">
                Every learner has unique strengths and areas for growth. This information
                helps us create a supportive, personalized experience that builds confidence
                while addressing specific needs.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">🔒</div>
            <div>
              <h4 className="font-semibold text-ink-900 mb-1">
                Confidential & Secure
              </h4>
              <p className="text-sm text-gray-700">
                All challenge information is kept strictly confidential and used only
                to design appropriate learning materials. We never share this data
                without your explicit permission.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
