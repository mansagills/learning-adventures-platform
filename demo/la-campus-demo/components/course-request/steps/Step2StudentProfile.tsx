'use client';

import { useFormContext } from '../FormContext';
import RadioGroup from '../inputs/RadioGroup';
import MultiSelectCheckbox from '../inputs/MultiSelectCheckbox';
import TextAreaField from '../inputs/TextAreaField';

const gradeLevelOptions = [
  { label: 'Pre-K', value: 'PRE_K' },
  { label: 'Kindergarten', value: 'K' },
  { label: '1st Grade', value: '1' },
  { label: '2nd Grade', value: '2' },
  { label: '3rd Grade', value: '3' },
  { label: '4th Grade', value: '4' },
  { label: '5th Grade', value: '5' },
  { label: '6th Grade', value: '6' },
  { label: '7th Grade', value: '7' },
  { label: '8th Grade', value: '8' },
  { label: '9th Grade', value: '9' },
  { label: '10th Grade', value: '10' },
  { label: '11th Grade', value: '11' },
  { label: '12th Grade', value: '12' },
];

const studentCountOptions = [
  {
    label: 'Single Student',
    value: 'SINGLE',
    icon: '👤',
    description: 'Course for one learner',
  },
  {
    label: 'Small Group (2-5)',
    value: 'SMALL_GROUP',
    icon: '👥',
    description: 'Perfect for siblings or friends',
  },
  {
    label: 'Classroom (6-15)',
    value: 'CLASSROOM_SMALL',
    icon: '👨‍👩‍👧‍👦',
    description: 'Small classroom setting',
  },
  {
    label: 'Large Class (16+)',
    value: 'CLASSROOM_LARGE',
    icon: '🏫',
    description: 'Full classroom',
  },
];

const accommodationOptions = [
  {
    label: 'ADHD Support',
    value: 'ADHD',
    description: 'Short activities, frequent breaks, clear structure',
  },
  {
    label: 'Dyslexia-Friendly',
    value: 'DYSLEXIA',
    description: 'Font choices, audio support, multi-sensory learning',
  },
  {
    label: 'Visual Impairment',
    value: 'VISUAL',
    description: 'Screen reader compatible, high contrast, audio descriptions',
  },
  {
    label: 'Hearing Impairment',
    value: 'HEARING',
    description: 'Captions, visual cues, text alternatives',
  },
  {
    label: 'Gifted/Advanced',
    value: 'GIFTED',
    description: 'Challenge activities, deeper exploration, faster pace',
  },
  {
    label: 'English Language Learner',
    value: 'ELL',
    description: 'Simplified language, visual aids, vocabulary support',
  },
  {
    label: 'Autism Spectrum',
    value: 'AUTISM',
    description:
      'Predictable routines, clear expectations, sensory considerations',
  },
  {
    label: 'Other',
    value: 'OTHER',
    description: 'Please describe in notes below',
  },
];

export default function Step2StudentProfile() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Student Profile
        </h2>
        <p className="text-gray-600">
          Help us understand the learner(s) for this course
        </p>
      </div>

      {/* Student Name/Alias */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-ink-900">
          Student Name or Alias
          <span className="text-coral-500 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.studentName || ''}
          onChange={(e) => updateField('studentName', e.target.value)}
          placeholder="e.g., Sarah, Team Rocket, 3rd Period Class"
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            ${
              errors.studentName
                ? 'border-coral-500 bg-coral-50'
                : 'border-gray-200 bg-white hover:border-brand-300'
            }
          `}
        />
        <p className="text-xs text-gray-600">
          Use a nickname or alias if you prefer (we respect privacy!)
        </p>
        {errors.studentName && (
          <p className="text-sm text-coral-600">{errors.studentName}</p>
        )}
      </div>

      {/* Student Age */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-ink-900">
          Student Age
          <span className="text-coral-500 ml-1">*</span>
        </label>
        <input
          type="number"
          min="3"
          max="18"
          value={formData.studentAge || ''}
          onChange={(e) => updateField('studentAge', parseInt(e.target.value))}
          placeholder="Age"
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            ${
              errors.studentAge
                ? 'border-coral-500 bg-coral-50'
                : 'border-gray-200 bg-white hover:border-brand-300'
            }
          `}
        />
        {errors.studentAge && (
          <p className="text-sm text-coral-600">{errors.studentAge}</p>
        )}
      </div>

      {/* Grade Level */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-ink-900">
          Grade Level
          <span className="text-coral-500 ml-1">*</span>
        </label>
        <select
          value={formData.gradeLevel || ''}
          onChange={(e) => updateField('gradeLevel', e.target.value)}
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            ${
              errors.gradeLevel
                ? 'border-coral-500 bg-coral-50'
                : 'border-gray-200 bg-white hover:border-brand-300'
            }
          `}
        >
          <option value="">Select grade level</option>
          {gradeLevelOptions.map((grade) => (
            <option key={grade.value} value={grade.value}>
              {grade.label}
            </option>
          ))}
        </select>
        {errors.gradeLevel && (
          <p className="text-sm text-coral-600">{errors.gradeLevel}</p>
        )}
      </div>

      {/* Number of Students */}
      <RadioGroup
        label="Number of Students"
        value={formData.numberOfStudents || 'SINGLE'}
        onChange={(value) => updateField('numberOfStudents', value)}
        options={studentCountOptions}
        error={errors.numberOfStudents}
        required
        layout="horizontal"
      />

      {/* Learning Accommodations */}
      <MultiSelectCheckbox
        label="Learning Accommodations Needed"
        value={formData.learningAccommodations || []}
        onChange={(value) => updateField('learningAccommodations', value)}
        options={accommodationOptions}
        error={errors.learningAccommodations}
      />

      {/* Accommodation Notes */}
      {formData.learningAccommodations &&
        formData.learningAccommodations.length > 0 && (
          <TextAreaField
            label="Additional Accommodation Details"
            value={formData.accommodationNotes || ''}
            onChange={(value) => updateField('accommodationNotes', value)}
            placeholder="Please provide any specific details about accommodations needed..."
            helpText="Help us understand how to best support your learner"
            rows={4}
            maxLength={500}
            showCharacterCount
          />
        )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-sunshine-50 border border-sunshine-200 rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-2xl">💡</div>
          <div>
            <h4 className="font-semibold text-ink-900 mb-1">
              Privacy & Personalization
            </h4>
            <p className="text-sm text-gray-700">
              This information helps us tailor content to the right
              developmental level and learning needs. All details remain
              confidential and are used only for course design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
