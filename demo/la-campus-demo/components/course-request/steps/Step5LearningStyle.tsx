'use client';

import { useFormContext } from '../FormContext';
import MultiSelectCheckbox from '../inputs/MultiSelectCheckbox';

const learningStyleOptions = [
  {
    label: 'Visual Learner',
    value: 'VISUAL',
    description: 'Learns best with images, diagrams, videos, colors',
  },
  {
    label: 'Hands-On/Kinesthetic',
    value: 'KINESTHETIC',
    description: 'Learns by doing, building, moving, touching',
  },
  {
    label: 'Story-Based',
    value: 'NARRATIVE',
    description: 'Engages through stories, characters, scenarios',
  },
  {
    label: 'Auditory',
    value: 'AUDITORY',
    description: 'Learns through listening, discussion, verbal instruction',
  },
  {
    label: 'Game-Based',
    value: 'GAME_BASED',
    description: 'Motivated by challenges, points, competition',
  },
  {
    label: 'Social/Collaborative',
    value: 'SOCIAL',
    description: 'Thrives in group work and peer interaction',
  },
  {
    label: 'Independent',
    value: 'INDEPENDENT',
    description: 'Prefers self-paced, individual work',
  },
  {
    label: 'Analytical/Logical',
    value: 'ANALYTICAL',
    description: 'Enjoys patterns, systems, cause-effect relationships',
  },
];

const interestOptions = [
  { label: 'Animals & Nature', value: 'ANIMALS' },
  { label: 'Sports & Athletics', value: 'SPORTS' },
  { label: 'Art & Creativity', value: 'ART' },
  { label: 'Music & Dance', value: 'MUSIC' },
  { label: 'Technology & Coding', value: 'TECHNOLOGY' },
  { label: 'Space & Astronomy', value: 'SPACE' },
  { label: 'Dinosaurs & Prehistoric Life', value: 'DINOSAURS' },
  { label: 'Superheroes & Adventure', value: 'SUPERHEROES' },
  { label: 'Fantasy & Magic', value: 'FANTASY' },
  { label: 'Science Experiments', value: 'EXPERIMENTS' },
  { label: 'Building & Engineering', value: 'BUILDING' },
  { label: 'History & Culture', value: 'HISTORY' },
  { label: 'Mystery & Detective Stories', value: 'MYSTERY' },
  { label: 'Cooking & Food', value: 'COOKING' },
  { label: 'Fashion & Design', value: 'FASHION' },
  { label: 'Video Games', value: 'VIDEO_GAMES' },
  { label: 'Reading & Books', value: 'READING' },
  { label: 'Outdoor Activities', value: 'OUTDOORS' },
];

export default function Step5LearningStyle() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Learning Style & Interests
        </h2>
        <p className="text-gray-600">
          How does this student learn best? What captures their attention?
        </p>
      </div>

      {/* Learning Styles */}
      <MultiSelectCheckbox
        label="Preferred Learning Styles"
        value={formData.learningStyles || []}
        onChange={(value) => updateField('learningStyles', value)}
        options={learningStyleOptions}
        error={errors.learningStyles}
      />

      {/* Student Interests */}
      <MultiSelectCheckbox
        label="Student Interests & Hobbies"
        value={formData.studentInterests || []}
        onChange={(value) => updateField('studentInterests', value)}
        options={interestOptions}
        error={errors.studentInterests}
      />

      {/* Favorite Characters/Themes */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-ink-900">
          Favorite Characters, Shows, or Themes
          <span className="text-gray-500 text-xs ml-2">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.favoriteCharacters || ''}
          onChange={(e) => updateField('favoriteCharacters', e.target.value)}
          placeholder="e.g., Pokemon, Minecraft, Harry Potter, Bluey, princesses, robots..."
          className="
            w-full px-4 py-3 rounded-lg border-2 transition-all
            border-gray-200 bg-white hover:border-brand-300
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          "
        />
        <p className="text-xs text-gray-600">
          We can incorporate these themes into lessons to boost engagement
        </p>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-sunshine-50 border border-sunshine-200 rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-2xl">🎨</div>
          <div>
            <h4 className="font-semibold text-ink-900 mb-1">
              Why Learning Styles Matter
            </h4>
            <p className="text-sm text-gray-700 mb-2">
              Understanding how a student learns best helps us create content
              that:
            </p>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• Matches their natural strengths</li>
              <li>• Keeps them engaged and motivated</li>
              <li>• Makes learning feel fun, not like work</li>
              <li>• Builds confidence through success</li>
            </ul>
            <p className="text-sm text-gray-700 mt-2">
              For example, if a student loves dinosaurs and learns
              kinesthetically, we might create a hands-on fossil dig game to
              teach measurement skills!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
