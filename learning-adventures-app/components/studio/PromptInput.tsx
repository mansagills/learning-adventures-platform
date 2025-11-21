'use client';

import { useState } from 'react';
import Icon from '@/components/Icon';

interface PromptInputProps {
  onGenerationStart?: () => void;
  onGenerate: (content: any) => void;
  onGenerationError?: () => void;
  isGenerating?: boolean;
}

const TEMPLATES = [
  {
    name: 'Math Racing Game',
    prompt: 'Create a multiplication racing game where students control a race car by solving multiplication problems (2-12 tables). The faster they answer correctly, the faster their car goes. Include power-ups for streaks.',
    config: { category: 'math', gameType: 'HTML_2D', gradeLevel: ['3', '4', '5'], difficulty: 'medium', skills: ['Multiplication', 'Speed Math'] }
  },
  {
    name: '3D Science Simulator',
    prompt: 'Create a 3D solar system simulator where students can explore planets, adjust orbital speed, and see realistic physics. Include planet facts and interactive controls.',
    config: { category: 'science', gameType: 'HTML_3D', gradeLevel: ['5', '6', '7'], difficulty: 'medium', skills: ['Astronomy', 'Physics', 'Space Science'] }
  },
  {
    name: 'Vocabulary Adventure',
    prompt: 'Create a vocabulary building game where students help a character navigate an adventure by choosing the correct synonym or antonym. Include visual word cards and progressive difficulty.',
    config: { category: 'english', gameType: 'INTERACTIVE', gradeLevel: ['3', '4', '5'], difficulty: 'easy', skills: ['Vocabulary', 'Synonyms', 'Antonyms'] }
  }
];

export default function PromptInput({ onGenerationStart, onGenerate, onGenerationError, isGenerating = false }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [config, setConfig] = useState({
    category: 'math',
    gameType: 'HTML_2D',
    gradeLevel: ['3', '4', '5'],
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    skills: [] as string[]
  });
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (prompt.length < 20) {
      setError('Prompt must be at least 20 characters');
      return;
    }

    if (config.gradeLevel.length === 0) {
      setError('Please select at least one grade level');
      return;
    }

    if (config.skills.length === 0) {
      setError('Please add at least one learning skill');
      return;
    }

    setError('');

    // Notify parent that generation is starting
    if (onGenerationStart) {
      onGenerationStart();
    }

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...config })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Generation failed');
        // Reset loading state on error
        if (onGenerationError) {
          onGenerationError();
        }
        return;
      }

      onGenerate(data);
    } catch (err: any) {
      setError(err.message || 'Network error');
      // Reset loading state on network error
      if (onGenerationError) {
        onGenerationError();
      }
    }
  };

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    setPrompt(template.prompt);
    setConfig({ ...config, ...template.config });
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !config.skills.includes(skillInput.trim())) {
      setConfig({ ...config, skills: [...config.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setConfig({ ...config, skills: config.skills.filter(s => s !== skill) });
  };

  const toggleGradeLevel = (grade: string) => {
    const newGrades = config.gradeLevel.includes(grade)
      ? config.gradeLevel.filter(g => g !== grade)
      : [...config.gradeLevel, grade];
    setConfig({ ...config, gradeLevel: newGrades });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Describe Your Game</h2>

      {/* Template Selector */}
      <div className="mb-4">
        <p className="text-sm text-ink-600 mb-2">Quick Start Templates:</p>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => handleTemplateSelect(template)}
              disabled={isGenerating}
              className="px-3 py-1 bg-brand-100 text-brand-700 rounded-lg text-sm hover:bg-brand-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {template.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Prompt */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-ink-700 mb-2">
          Game Description *
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          className="w-full h-48 p-4 border-2 border-gray-300 rounded-lg focus:border-brand-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          placeholder="Example: Create a 3D multiplication game where students pilot a spaceship and solve multiplication problems to navigate through asteroid fields. Include power-ups for streaks and celebratory animations for correct answers."
        />
        <p className="text-sm text-ink-500 mt-1">
          {prompt.length} characters (minimum 20)
        </p>
      </div>

      {/* Configuration Options */}
      <div className="space-y-3 mb-6">
        {/* Subject Category */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Subject *
          </label>
          <select
            value={config.category}
            onChange={(e) => setConfig({ ...config, category: e.target.value })}
            disabled={isGenerating}
            className="w-full p-3 border rounded-lg focus:border-brand-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="math">Math</option>
            <option value="science">Science</option>
            <option value="english">English</option>
            <option value="history">History</option>
            <option value="interdisciplinary">Interdisciplinary</option>
          </select>
        </div>

        {/* Game Type */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Game Type *
          </label>
          <select
            value={config.gameType}
            onChange={(e) => setConfig({ ...config, gameType: e.target.value })}
            disabled={isGenerating}
            className="w-full p-3 border rounded-lg focus:border-brand-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
          >
            <option value="HTML_2D">2D Interactive Game</option>
            <option value="HTML_3D">3D Simulation (with Three.js)</option>
            <option value="INTERACTIVE">Interactive Lesson</option>
            <option value="QUIZ">Quiz/Assessment</option>
            <option value="SIMULATION">Science Simulation</option>
            <option value="PUZZLE">Logic Puzzle</option>
          </select>
        </div>

        {/* Grade Level */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Grade Level * (select one or more)
          </label>
          <div className="flex flex-wrap gap-2">
            {['K', '1', '2', '3', '4', '5', '6', '7', '8'].map((grade) => (
              <button
                key={grade}
                onClick={() => toggleGradeLevel(grade)}
                disabled={isGenerating}
                className={`px-3 py-1 rounded-lg border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  config.gradeLevel.includes(grade)
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-300 hover:border-brand-300'
                }`}
              >
                {grade === 'K' ? 'K' : grade}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Difficulty *
          </label>
          <div className="flex space-x-2">
            {['easy', 'medium', 'hard'].map((level) => (
              <button
                key={level}
                onClick={() => setConfig({ ...config, difficulty: level as any })}
                disabled={isGenerating}
                className={`flex-1 py-2 rounded-lg border-2 capitalize transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  config.difficulty === level
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-300 hover:border-brand-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Skills */}
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1">
            Learning Skills * (e.g., Multiplication, Critical Thinking)
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill();
                }
              }}
              disabled={isGenerating}
              className="flex-1 p-2 border rounded-lg focus:border-brand-500 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="Type skill and press Enter"
            />
            <button
              onClick={handleAddSkill}
              disabled={isGenerating || !skillInput.trim()}
              className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
          {config.skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {config.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center px-3 py-1 bg-brand-100 text-brand-700 rounded-lg text-sm"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    disabled={isGenerating}
                    className="ml-2 text-brand-500 hover:text-brand-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || prompt.length < 20}
        className={`w-full py-4 rounded-lg font-semibold text-white transition-all ${
          isGenerating || prompt.length < 20
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-brand-500 to-accent-500 hover:shadow-lg'
        }`}
      >
        {isGenerating ? (
          <span className="flex items-center justify-center">
            <Icon name="loader" className="animate-spin mr-2" />
            Generating Game...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            ✨ Generate Game
          </span>
        )}
      </button>

      {/* Cost Estimate */}
      <p className="text-xs text-ink-500 mt-2 text-center">
        Estimated cost: ~$0.30 per generation
      </p>
    </div>
  );
}
