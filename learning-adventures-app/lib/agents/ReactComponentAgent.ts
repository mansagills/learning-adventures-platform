/**
 * React Component Agent
 * Creates React-based educational games using the react-game-component skill
 */

import { BaseAgent } from './BaseAgent';
import {
  AgentResult,
  GameConcept,
} from './types';

// TODO: Move these types to ./types.ts
interface ReactComponentResponse {
  componentCode: string;
  gameId: string;
  metadata: GameConcept;
  dependencies: string[];
  fileStructure: {
    mainFile: string;
    additionalFiles?: Array<{ path: string; content: string }>;
  };
}

interface ReactGameWorkflowInput {
  gameIdea: string;
  subject: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string;
  complexity: 'simple' | 'moderate' | 'complex';
  features: string[];
  skills?: string[];
  learningObjectives?: string[];
}

export class ReactComponentAgent extends BaseAgent {
  constructor() {
    super(
      'react-component',
      ['docs/skills/react-game-component/SKILL.md'],
      'You are a React component agent. Create React-based educational games.'
    );
  }

  /**
   * Execute React component creation task
   */
  async execute(input: ReactGameWorkflowInput | { concept: GameConcept; fixes?: string[] }): Promise<AgentResult> {
    try {
      // Load skills
      await this.loadSkills();

      let concept: GameConcept;
      let complexity: 'simple' | 'moderate' | 'complex';
      let features: string[];
      let additionalInstructions = '';

      // Handle two input types: initial creation or fixing
      if ('gameIdea' in input) {
        // Initial creation
        const reactInput = input as ReactGameWorkflowInput;
        concept = this.createConcept(reactInput);
        complexity = reactInput.complexity;
        features = reactInput.features;
      } else {
        // Fixing/refinement
        const fixInput = input as any;
        concept = fixInput.concept;
        complexity = fixInput.complexity || 'moderate';
        features = fixInput.features || [];
        if (fixInput.fixes) {
          additionalInstructions = `\n\nPlease apply these fixes:\n${fixInput.fixes.join('\n')}`;
        }
      }

      // Build the prompt for Claude
      const prompt = this.buildPrompt(concept, complexity, features, additionalInstructions);

      // Generate React component code
      const componentCode = await this.generateComponentCode(prompt, concept);
      const gameId = this.generateGameId(concept.title);

      const response: ReactComponentResponse = {
        componentCode,
        gameId,
        metadata: concept,
        dependencies: this.extractDependencies(features),
        fileStructure: {
          mainFile: `components/games/${gameId}/index.tsx`,
        },
      };

      return {
        success: true,
        output: response,
        errors: [],
        warnings: this.generateWarnings(componentCode),
        metadata: {
          duration: 0,
          timestamp: new Date(),
          version: '1.0.0',
        },
      };

    } catch (error) {
      return {
        success: false,
        output: null,
        errors: [(error as Error).message],
        warnings: [],
        metadata: {
          duration: 0,
          timestamp: new Date(),
          version: '1.0.0',
        },
      };
    }
  }

  /**
   * Create game concept from workflow input
   */
  private createConcept(input: ReactGameWorkflowInput): GameConcept {
    return {
      title: this.extractTitle(input.gameIdea),
      description: input.gameIdea,
      subject: input.subject as any,
      gradeLevel: input.gradeLevel,
      skills: input.skills || [],
      learningObjectives: input.learningObjectives || this.generateLearningObjectives(input),
      estimatedTime: `${this.estimatePlayTime(input.complexity)} minutes`,
      difficulty: this.determineDifficulty(input.complexity),
      gameplayMechanics: input.features || [],
      educationalValue: 8,
    };
  }

  /**
   * Build prompt for React component generation
   */
  private buildPrompt(
    concept: GameConcept,
    complexity: string,
    features: string[],
    additionalInstructions: string
  ): string {
    return `Create a React-based educational game component with the following specifications:

**Title**: ${concept.title}
**Description**: ${concept.description}
**Subject**: ${concept.subject}
**Grade Level**: ${concept.gradeLevel}
**Difficulty**: ${concept.difficulty}
**Complexity**: ${complexity}
**Estimated Play Time**: ${concept.estimatedTime} minutes

**Skills to Practice**:
${concept.skills.map(s => `- ${s}`).join('\n')}

**Learning Objectives**:
${concept.learningObjectives.map(o => `- ${o}`).join('\n')}

**Features to Include**:
${features.map(f => `- ${f}`).join('\n')}

**Technical Requirements**:
- TypeScript React component
- Use platform shared components (GameContainer, GameButton, ScoreBoard, GameModal)
- Use platform hooks (useGameState, useGameTimer, useGameAudio)
- Follow platform architecture patterns
- Responsive design
- Accessibility compliant (WCAG 2.1 AA)
- Type-safe with proper interfaces

**Shared Components Available**:
- GameContainer: Main game wrapper with header and controls
- GameButton: Styled interactive button
- ScoreBoard: Display score and stats
- GameModal: Modal for instructions/results
- ProgressBar: Visual progress indicator

**Shared Hooks Available**:
- useGameState: Manage game state and score
- useGameTimer: Track time and countdown
- useGameAudio: Play sound effects

**Component Structure**:
- Main component file: [GameName].tsx
- Type definitions: types.ts
- Helper utilities: utils.ts
- Registration: index.ts

${additionalInstructions}

Please generate a complete, production-ready React component that follows the platform architecture.`;
  }

  /**
   * Generate React component code (simulated - would call Claude API in production)
   */
  private async generateComponentCode(prompt: string, concept: GameConcept): Promise<string> {
    // This is a placeholder that shows the structure
    // In production, this would call the Claude API with the prompt and skill context

    const gameId = this.generateGameId(concept.title);
    const componentName = this.generateComponentName(concept.title);

    return `/**
 * ${concept.title}
 * ${concept.description}
 *
 * Subject: ${concept.subject}
 * Grade Level: ${concept.gradeLevel}
 */

'use client';

import React, { useState, useEffect } from 'react';
import { GameContainer } from '@/components/games/shared/GameContainer';
import { GameButton } from '@/components/games/shared/GameButton';
import { ScoreBoard } from '@/components/games/shared/ScoreBoard';
import { GameModal } from '@/components/games/shared/GameModal';
import { useGameState } from '@/hooks/useGameState';
import { useGameTimer } from '@/hooks/useGameTimer';

interface GameState {
  score: number;
  level: number;
  isPlaying: boolean;
  showInstructions: boolean;
}

export default function ${componentName}() {
  const { gameState, updateScore, resetGame } = useGameState({
    initialScore: 0,
    gameId: '${gameId}',
  });

  const { timeElapsed, startTimer, stopTimer, resetTimer } = useGameTimer();

  const [state, setState] = useState<GameState>({
    score: 0,
    level: 1,
    isPlaying: false,
    showInstructions: true,
  });

  // PLACEHOLDER: Game logic would be generated by Claude API
  // This would include:
  // - Game state management
  // - User interaction handlers
  // - Score calculation
  // - Level progression
  // - Educational content integration

  const startGame = () => {
    setState(prev => ({
      ...prev,
      isPlaying: true,
      showInstructions: false,
    }));
    startTimer();
  };

  const handleAnswer = (answer: any) => {
    // PLACEHOLDER: Answer validation logic
    console.log('Answer submitted:', answer);
  };

  return (
    <GameContainer
      title="${concept.title}"
      onReset={resetGame}
      className="max-w-4xl"
    >
      {/* Instructions Modal */}
      {state.showInstructions && (
        <GameModal
          title="How to Play"
          onClose={() => setState(prev => ({ ...prev, showInstructions: false }))}
        >
          <div className="space-y-4">
            <p>${concept.description}</p>
            <h3 className="font-bold">Learning Objectives:</h3>
            <ul className="list-disc pl-5">
              ${concept.learningObjectives.map(obj => `<li>${obj}</li>`).join('\n              ')}
            </ul>
            <GameButton onClick={startGame}>Start Playing</GameButton>
          </div>
        </GameModal>
      )}

      {/* Score Display */}
      <ScoreBoard
        score={state.score}
        level={state.level}
        timeElapsed={timeElapsed}
      />

      {/* Game Area */}
      <div className="game-area p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        {!state.isPlaying ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">${concept.title}</h2>
            <GameButton onClick={startGame}>Start Game</GameButton>
          </div>
        ) : (
          <div>
            {/* PLACEHOLDER: Interactive game content would be generated here */}
            <p className="text-center text-gray-600">
              Game content generated by Claude API would appear here
            </p>
          </div>
        )}
      </div>

      {/* AGENT NOTE: Complete game implementation would be generated by Claude API */}
    </GameContainer>
  );
}`;
  }

  /**
   * Generate registration code for the game
   */
  private generateRegistrationCode(concept: GameConcept): string {
    const gameId = this.generateGameId(concept.title);
    const componentName = this.generateComponentName(concept.title);

    return `/**
 * Registration file for ${concept.title}
 */

import ${componentName} from './${componentName}';

export const gameInfo = {
  id: '${gameId}',
  title: '${concept.title}',
  description: '${concept.description}',
  category: '${concept.subject}',
  gradeLevel: '${concept.gradeLevel}',
  difficulty: '${concept.difficulty}',
  skills: ${JSON.stringify(concept.skills)},
  estimatedTime: ${concept.estimatedTime},
};

export default ${componentName};
`;
  }

  /**
   * Extract dependencies based on features
   */
  private extractDependencies(features: string[]): string[] {
    const deps: string[] = ['react', '@/components/games/shared/*', '@/hooks/*'];

    if (features.includes('audio') || features.includes('sound')) {
      deps.push('useGameAudio');
    }
    if (features.includes('animation')) {
      deps.push('framer-motion');
    }
    if (features.includes('drag-and-drop')) {
      deps.push('@dnd-kit/core');
    }

    return deps;
  }

  /**
   * Validate generated component code
   */
  protected validate(output: any): boolean {
    const response = output as ReactComponentResponse;

    // Check required fields
    if (!response.componentCode) return false;
    if (!response.gameId) return false;
    if (!response.metadata) return false;

    // Check component code structure
    if (response.componentCode) {
      if (!response.componentCode.includes('export default')) {
        return false;
      }
    }

    return true;
  }

  /**
   * Generate warnings based on code analysis
   */
  private generateWarnings(code: string): string[] {
    const warnings: string[] = [];

    if (!code.includes('useGameState')) {
      warnings.push('Consider using useGameState hook for state management');
    }

    if (!code.includes('aria-')) {
      warnings.push('Missing ARIA attributes for accessibility');
    }

    if (!code.includes('ScoreBoard')) {
      warnings.push('Consider using ScoreBoard component for consistent UI');
    }

    return warnings;
  }

  /**
   * Utility methods
   */
  private extractTitle(gameIdea: string): string {
    const firstSentence = gameIdea.split('.')[0];
    return firstSentence.length > 50
      ? firstSentence.substring(0, 50) + '...'
      : firstSentence;
  }

  private generateGameId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generateComponentName(title: string): string {
    return title
      .split(/\s+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
      .replace(/[^a-zA-Z0-9]/g, '');
  }

  private generateLearningObjectives(input: ReactGameWorkflowInput): string[] {
    const objectives: string[] = [];

    if (input.skills && input.skills.length > 0) {
      objectives.push(`Practice ${input.skills.join(', ')}`);
    }
    objectives.push(`Apply ${input.subject} concepts interactively`);
    objectives.push(`Develop problem-solving skills through gameplay`);

    return objectives;
  }

  private estimatePlayTime(complexity: string): number {
    switch (complexity) {
      case 'simple': return 10;
      case 'moderate': return 15;
      case 'complex': return 20;
      default: return 15;
    }
  }

  private determineDifficulty(complexity: string): 'easy' | 'medium' | 'hard' {
    switch (complexity) {
      case 'simple': return 'easy';
      case 'moderate': return 'medium';
      case 'complex': return 'hard';
      default: return 'medium';
    }
  }
}
