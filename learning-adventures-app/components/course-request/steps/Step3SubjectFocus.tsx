'use client';

import { useFormContext } from '../FormContext';
import RadioGroup from '../inputs/RadioGroup';
import MultiSelectCheckbox from '../inputs/MultiSelectCheckbox';

const subjectOptions = [
  { label: 'Mathematics', value: 'MATH', icon: '🔢' },
  { label: 'Science', value: 'SCIENCE', icon: '🔬' },
  { label: 'English/Language Arts', value: 'ENGLISH', icon: '📚' },
  { label: 'History/Social Studies', value: 'HISTORY', icon: '🏛️' },
  { label: 'Interdisciplinary', value: 'INTERDISCIPLINARY', icon: '🌈' },
];

const mathTopics = [
  { label: 'Addition & Subtraction', value: 'addition_subtraction' },
  { label: 'Multiplication & Division', value: 'multiplication_division' },
  { label: 'Fractions & Decimals', value: 'fractions_decimals' },
  { label: 'Geometry & Shapes', value: 'geometry' },
  { label: 'Measurement & Data', value: 'measurement_data' },
  { label: 'Algebra Basics', value: 'algebra' },
  { label: 'Problem Solving Strategies', value: 'problem_solving' },
];

const scienceTopics = [
  { label: 'Life Science (Plants, Animals)', value: 'life_science' },
  { label: 'Earth Science (Weather, Geology)', value: 'earth_science' },
  { label: 'Physical Science (Matter, Energy)', value: 'physical_science' },
  { label: 'Space & Astronomy', value: 'space' },
  { label: 'Human Body Systems', value: 'human_body' },
  { label: 'Environmental Science', value: 'environment' },
  { label: 'Scientific Method', value: 'scientific_method' },
];

const englishTopics = [
  { label: 'Reading Comprehension', value: 'reading_comprehension' },
  { label: 'Writing Skills', value: 'writing' },
  { label: 'Grammar & Mechanics', value: 'grammar' },
  { label: 'Vocabulary Building', value: 'vocabulary' },
  { label: 'Phonics & Decoding', value: 'phonics' },
  { label: 'Literature Analysis', value: 'literature' },
  { label: 'Creative Writing', value: 'creative_writing' },
];

const historyTopics = [
  { label: 'American History', value: 'american_history' },
  { label: 'World History', value: 'world_history' },
  { label: 'Geography', value: 'geography' },
  { label: 'Civics & Government', value: 'civics' },
  { label: 'Cultural Studies', value: 'culture' },
  { label: 'Historical Thinking Skills', value: 'historical_thinking' },
];

const interdisciplinaryTopics = [
  { label: 'STEM Projects', value: 'stem' },
  { label: 'Arts Integration', value: 'arts' },
  { label: 'Critical Thinking', value: 'critical_thinking' },
  { label: 'Digital Literacy', value: 'digital_literacy' },
  { label: 'Social-Emotional Learning', value: 'sel' },
  { label: 'Financial Literacy', value: 'financial_literacy' },
];

const learningGoalOptions = [
  {
    label: 'Catch Up',
    value: 'CATCH_UP',
    icon: '🎯',
    description: 'Review and master foundational concepts'
  },
  {
    label: 'Reinforce',
    value: 'REINFORCE',
    icon: '💪',
    description: 'Practice and strengthen current grade-level skills'
  },
  {
    label: 'Get Ahead',
    value: 'ENRICH',
    icon: '🚀',
    description: 'Explore advanced concepts and challenge skills'
  },
  {
    label: 'Explore Interest',
    value: 'EXPLORE',
    icon: '🔍',
    description: 'Dive deep into a topic of personal interest'
  },
];

export default function Step3SubjectFocus() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  // Determine which topics to show based on selected subject
  const getTopicOptions = () => {
    switch (formData.primarySubject) {
      case 'MATH':
        return mathTopics;
      case 'SCIENCE':
        return scienceTopics;
      case 'ENGLISH':
        return englishTopics;
      case 'HISTORY':
        return historyTopics;
      case 'INTERDISCIPLINARY':
        return interdisciplinaryTopics;
      default:
        return [];
    }
  };

  const topicOptions = getTopicOptions();

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Subject & Focus Area
        </h2>
        <p className="text-gray-600">
          What should this course focus on?
        </p>
      </div>

      {/* Primary Subject */}
      <RadioGroup
        label="Primary Subject"
        value={formData.primarySubject || ''}
        onChange={(value) => {
          updateField('primarySubject', value);
          // Clear topics when subject changes
          updateField('specificTopics', []);
        }}
        options={subjectOptions}
        error={errors.primarySubject}
        required
        layout="horizontal"
      />

      {/* Specific Topics (shown after subject selected) */}
      {formData.primarySubject && topicOptions.length > 0 && (
        <MultiSelectCheckbox
          label="Specific Topics to Cover"
          value={formData.specificTopics || []}
          onChange={(value) => updateField('specificTopics', value)}
          options={topicOptions}
          error={errors.specificTopics}
        />
      )}

      {/* Custom Topics */}
      {formData.primarySubject && (
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-ink-900">
            Additional Topics or Themes
            <span className="text-gray-500 text-xs ml-2">(Optional)</span>
          </label>
          <textarea
            value={formData.customTopics || ''}
            onChange={(e) => updateField('customTopics', e.target.value)}
            placeholder="Any specific topics not listed above? E.g., 'Ancient Egypt pyramids', 'Butterfly life cycle', 'Poetry writing'..."
            rows={3}
            className="
              w-full px-4 py-3 rounded-lg border-2 transition-all
              border-gray-200 bg-white hover:border-brand-300
              focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
              resize-y min-h-[80px]
            "
          />
        </div>
      )}

      {/* Learning Goal */}
      <RadioGroup
        label="Learning Goal"
        value={formData.learningGoal || ''}
        onChange={(value) => updateField('learningGoal', value)}
        options={learningGoalOptions}
        error={errors.learningGoal}
        required
        layout="horizontal"
      />

      {/* Help Text */}
      <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-2xl">✨</div>
          <div>
            <h4 className="font-semibold text-ink-900 mb-1">
              Building Your Custom Curriculum
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Based on your selections, our AI will generate a personalized learning path with:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Interactive games aligned to your chosen topics</li>
              <li>• Lessons at the appropriate difficulty level</li>
              <li>• Projects that connect to student interests</li>
              <li>• Assessments that match your learning goals</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
