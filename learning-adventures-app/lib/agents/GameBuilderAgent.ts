/**
 * Game Builder Agent
 * Creates HTML educational games using the educational-game-builder skill
 */

import { BaseAgent } from './BaseAgent';
import {
  AgentResult,
  GameConcept,
} from './types';

// TODO: Move these types to ./types.ts
interface GameBuilderResponse {
  gameCode: string;
  gameId: string;
  metadata: GameConcept;
  technicalSpecs: {
    fileSize: number;
    lineCount: number;
    hasAccessibilityFeatures: boolean;
  };
}

interface HTMLGameWorkflowInput {
  gameIdea: string;
  subject: 'math' | 'science' | 'english' | 'history' | 'interdisciplinary';
  gradeLevel: string;
  skills: string[];
  learningObjectives?: string[];
}

export class GameBuilderAgent extends BaseAgent {
  constructor() {
    super(
      'game-builder',
      ['docs/skills/educational-game-builder/SKILL.md'],
      'You are a game builder agent. Create HTML educational games.'
    );
  }

  /**
   * Execute game building task
   */
  async execute(input: HTMLGameWorkflowInput | { concept: GameConcept; fixes?: string[] }): Promise<AgentResult> {
    try {
      // Load skills
      await this.loadSkills();

      let concept: GameConcept;
      let additionalInstructions = '';

      // Handle two input types: initial creation or fixing
      if ('gameIdea' in input) {
        // Initial creation
        concept = this.createConcept(input as HTMLGameWorkflowInput);
      } else {
        // Fixing/refinement
        concept = (input as any).concept;
        if ((input as any).fixes) {
          additionalInstructions = `\n\nPlease apply these fixes:\n${(input as any).fixes.join('\n')}`;
        }
      }

      // Build the prompt for Claude
      const prompt = this.buildPrompt(concept, additionalInstructions);

      // In a real implementation, this would call Claude API
      // For now, we'll simulate the response with a structured output
      const gameCode = await this.generateGameCode(prompt, concept);

      const response: GameBuilderResponse = {
        gameCode,
        gameId: this.generateGameId(concept.title),
        metadata: concept,
        technicalSpecs: {
          fileSize: gameCode.length,
          lineCount: gameCode.split('\n').length,
          hasAccessibilityFeatures: this.checkAccessibilityFeatures(gameCode),
        },
      };

      return {
        success: true,
        output: response,
        errors: [],
        warnings: this.generateWarnings(gameCode),
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
  private createConcept(input: HTMLGameWorkflowInput): GameConcept {
    return {
      title: this.extractTitle(input.gameIdea),
      description: input.gameIdea,
      subject: input.subject,
      gradeLevel: input.gradeLevel,
      skills: input.skills,
      learningObjectives: input.learningObjectives || this.generateLearningObjectives(input),
      estimatedTime: `${this.estimatePlayTime(input)} minutes`,
      difficulty: this.determineDifficulty(input.gradeLevel),
      gameplayMechanics: [],
      educationalValue: 8,
    };
  }

  /**
   * Build prompt for game generation
   */
  private buildPrompt(concept: GameConcept, additionalInstructions: string): string {
    return `Create an educational HTML game with the following specifications:

**Title**: ${concept.title}
**Description**: ${concept.description}
**Subject**: ${concept.subject}
**Grade Level**: ${concept.gradeLevel}
**Difficulty**: ${concept.difficulty}
**Estimated Play Time**: ${concept.estimatedTime} minutes

**Skills to Practice**:
${concept.skills.map(s => `- ${s}`).join('\n')}

**Learning Objectives**:
${concept.learningObjectives.map(o => `- ${o}`).join('\n')}

**Requirements**:
- Single HTML file with embedded CSS and JavaScript
- Child-friendly, colorful interface
- WCAG 2.1 AA accessibility compliance
- 70% engagement / 30% obvious learning balance
- Progress tracking and immediate feedback
- Mobile-responsive design
- File size under 3MB
- 60 FPS smooth animations
- Browser compatible (Chrome, Firefox, Safari, Edge)

**Technical Specifications**:
- Use semantic HTML5 elements
- Include ARIA labels and roles
- Ensure keyboard navigation works
- Add screen reader support
- Include proper heading hierarchy
- Use sufficient color contrast (4.5:1 minimum)
- Add skip navigation links
- Support reduced motion preferences

${additionalInstructions}

Please generate a complete, production-ready HTML file that meets all these requirements.`;
  }

  /**
   * Generate game code (simulated - would call Claude API in production)
   */
  private async generateGameCode(prompt: string, concept: GameConcept): Promise<string> {
    // This is a placeholder that shows the structure
    // In production, this would call the Claude API with the prompt and skill context

    const skills = await this.loadSkills();
    const skillContext = skills.map(s => s.content).join('\n\n');

    // Simulated response structure
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${concept.title}</title>
    <meta name="description" content="${concept.description}">
    <style>
        /* Game styles would be generated here based on the educational-game-builder skill */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .game-container {
            background: white;
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 800px;
            width: 90%;
        }
        /* PLACEHOLDER: Full game styles would be generated by Claude API */
    </style>
</head>
<body>
    <div class="game-container" role="main" aria-label="${concept.title}">
        <h1>${concept.title}</h1>
        <p>${concept.description}</p>

        <!-- PLACEHOLDER: Game content would be generated by Claude API -->
        <!-- This would include:
             - Interactive game elements
             - Score tracking
             - Progress indicators
             - Feedback mechanisms
             - Accessibility features
        -->

        <div class="game-area" role="application" aria-label="Game play area">
            <!-- Generated game content -->
        </div>
    </div>

    <script>
        // PLACEHOLDER: Game logic would be generated by Claude API
        // This would include:
        // - Game state management
        // - User interaction handlers
        // - Score calculation
        // - Progress tracking
        // - Accessibility enhancements
        // - Keyboard navigation

        console.log('Game initialized: ${concept.title}');
    </script>
</body>
</html>

<!-- AGENT NOTE: In production, this would be a complete, fully-functional game generated by Claude API using the educational-game-builder skill -->
<!-- PROMPT USED: ${prompt.substring(0, 100)}... -->
<!-- SKILL CONTEXT: ${skillContext.substring(0, 100)}... -->`;
  }

  /**
   * Validate generated game code
   */
  protected validate(output: any): boolean {
    const response = output as GameBuilderResponse;

    // Check required fields
    if (!response.gameCode) return false;
    if (!response.gameId) return false;
    if (!response.metadata) return false;

    // Check game code structure
    if (response.gameCode) {
      if (!response.gameCode.includes('<!DOCTYPE html>')) {
        return false;
      }
      if (!response.gameCode.includes('<html')) {
        return false;
      }
    }

    // Check file size
    if (response.technicalSpecs?.fileSize > 3 * 1024 * 1024) {
      return false;
    }

    return true;
  }

  /**
   * Check for accessibility features in code
   */
  private checkAccessibilityFeatures(code: string): boolean {
    const features = [
      'role=',
      'aria-',
      'tabindex',
      'alt=',
      '<label',
    ];

    return features.some(feature => code.includes(feature));
  }

  /**
   * Generate warnings based on code analysis
   */
  private generateWarnings(code: string): string[] {
    const warnings: string[] = [];

    if (code.length < 1000) {
      warnings.push('Game code seems very short - may be incomplete');
    }

    if (!code.includes('addEventListener')) {
      warnings.push('No event listeners found - game may not be interactive');
    }

    if (!code.includes('score') && !code.includes('Score')) {
      warnings.push('No score tracking detected');
    }

    return warnings;
  }

  /**
   * Utility methods
   */
  private extractTitle(gameIdea: string): string {
    // Extract first sentence or first 50 chars as title
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

  private generateLearningObjectives(input: HTMLGameWorkflowInput): string[] {
    const objectives: string[] = [];

    objectives.push(`Practice ${input.skills.join(', ')}`);
    objectives.push(`Apply ${input.subject} concepts in an interactive setting`);
    objectives.push(`Develop problem-solving skills at ${input.gradeLevel} level`);

    return objectives;
  }

  private estimatePlayTime(input: HTMLGameWorkflowInput): number {
    // Estimate based on skills count and difficulty
    const baseTime = 10;
    const skillMultiplier = input.skills.length * 2;
    return baseTime + skillMultiplier;
  }

  private determineDifficulty(gradeLevel: string): 'easy' | 'medium' | 'hard' {
    if (gradeLevel.includes('K-2') || gradeLevel.includes('1') || gradeLevel.includes('2')) {
      return 'easy';
    }
    if (gradeLevel.includes('6-8') || gradeLevel.includes('9-12')) {
      return 'hard';
    }
    return 'medium';
  }
}
