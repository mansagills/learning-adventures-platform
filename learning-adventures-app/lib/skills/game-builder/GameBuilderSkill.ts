/**
 * Game Builder Skill
 *
 * Creates complete HTML educational games with embedded CSS and JavaScript.
 * Converted from GameBuilderAgent.
 */

import { BaseSkill } from '../BaseSkill';
import {
  SkillMetadata,
  SkillContext,
  SkillResult,
  GameConcept,
  GameFile,
} from '../types';

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

export class GameBuilderSkill extends BaseSkill {
  /**
   * Get skill metadata
   */
  public getMetadata(): SkillMetadata {
    return {
      id: 'game-builder',
      name: 'Game Builder',
      description:
        'Create complete HTML educational games with embedded CSS and JavaScript',
      triggers: [
        'build game',
        'create html',
        'implement game',
        'code game',
        'html game',
        'make game',
        'develop game',
        'build the game',
        'create the game',
        'build',
        'build one',
        'build it',
        'build this',
        'create it',
        'make it',
      ],
      capabilities: [
        'Generate single-file HTML games',
        'Embed CSS and JavaScript',
        'Apply WCAG 2.1 AA accessibility',
        'Create child-friendly interfaces',
        '60 FPS animations',
        'Mobile-responsive design',
        'File size under 3MB',
      ],
      examples: [
        'Build a math game for addition practice',
        'Create an HTML game about fractions',
        'Implement the multiplication race game',
        'Make a science game about ecosystems',
      ],
      version: '1.0.0',
      guidanceFile: 'SKILL.md',
    };
  }

  /**
   * Determine if this skill can handle the request
   */
  public async canHandle(
    userRequest: string,
    context?: Partial<SkillContext>
  ): Promise<number> {
    const metadata = this.getMetadata();
    let confidence = this.calculateKeywordConfidence(
      userRequest,
      metadata.triggers
    );

    // Boost confidence for implementation requests
    if (
      userRequest.toLowerCase().includes('build') ||
      userRequest.toLowerCase().includes('create') ||
      userRequest.toLowerCase().includes('implement') ||
      userRequest.toLowerCase().includes('make')
    ) {
      confidence = Math.min(confidence + 15, 100);
    }

    // Boost if HTML is mentioned
    if (userRequest.toLowerCase().includes('html')) {
      confidence = Math.min(confidence + 20, 100);
    }

    // Reduce if React is mentioned (that's a different skill)
    if (
      userRequest.toLowerCase().includes('react') ||
      userRequest.toLowerCase().includes('component')
    ) {
      confidence = Math.max(confidence - 30, 0);
    }

    // Reduce if it's just ideation
    if (
      userRequest.toLowerCase().includes('idea') ||
      userRequest.toLowerCase().includes('brainstorm')
    ) {
      confidence = Math.max(confidence - 20, 0);
    }

    return confidence;
  }

  /**
   * Execute the skill
   */
  public async execute(context: SkillContext): Promise<SkillResult> {
    const startTime = Date.now();

    try {
      // Extract game concept from context
      const concept = this.extractGameConcept(context);

      if (!concept) {
        return this.buildErrorResult(
          'Could not determine game specifications. Please provide details about the game you want to build.',
          'MISSING_CONCEPT'
        );
      }

      // Load guidance from markdown file
      const guidance = this.loadGuidance();

      // Build prompt
      const prompt = this.buildPrompt(concept, context);

      // Generate game code
      const gameCode = await this.generateGameCode(prompt, guidance, concept);

      // Validate game code
      if (!this.validate(gameCode)) {
        return this.buildErrorResult(
          'Generated game code failed validation.',
          'VALIDATION_FAILED'
        );
      }

      const gameId = this.generateGameId(concept.title);

      const response: GameBuilderResponse = {
        gameCode,
        gameId,
        metadata: concept,
        technicalSpecs: {
          fileSize: gameCode.length,
          lineCount: gameCode.split('\n').length,
          hasAccessibilityFeatures: this.checkAccessibilityFeatures(gameCode),
        },
      };

      const executionTime = Date.now() - startTime;
      const message = this.buildSuccessMessage(response);

      // Suggest next skills
      const suggestedNextSkills = [
        'accessibility-validator',
        'metadata-formatter',
      ];

      return this.buildSuccessResult(
        response,
        message,
        executionTime,
        90,
        suggestedNextSkills
      );
    } catch (error) {
      return this.buildErrorResult(
        `Game building failed: ${error}`,
        'EXECUTION_ERROR',
        error
      );
    }
  }

  /**
   * Validate output
   */
  protected validate(gameCode: string): boolean {
    if (!gameCode || gameCode.length === 0) {
      return false;
    }

    // Check for basic HTML structure
    const hasDoctype = gameCode.includes('<!DOCTYPE html>');
    const hasHtml = gameCode.includes('<html');
    const hasHead = gameCode.includes('<head>');
    const hasBody = gameCode.includes('<body>');

    // Check file size
    const fileSizeOk = gameCode.length < 3 * 1024 * 1024; // 3MB

    return hasDoctype && hasHtml && hasHead && hasBody && fileSizeOk;
  }

  /**
   * Extract game concept from context
   */
  private extractGameConcept(context: SkillContext): GameConcept | null {
    // Check if previous output contains a game concept (from ideation skill)
    if (context.previousOutputs?.has('game-ideation')) {
      const ideationOutput = context.previousOutputs.get('game-ideation');
      if (Array.isArray(ideationOutput) && ideationOutput.length > 0) {
        return ideationOutput[0]; // Use first concept
      }
    }

    // Try to create concept from user request
    const parsed = this.parseRequest(context.userRequest);

    if (!parsed.subject) {
      return null;
    }

    return {
      title: this.extractTitle(context.userRequest),
      description: context.userRequest,
      subject: parsed.subject,
      gradeLevel: parsed.gradeLevel || ['3'],
      learningObjectives: this.extractLearningObjectives(context.userRequest),
      estimatedPlayTime: '10-15 minutes',
      difficulty: (parsed.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
      gameplayMechanics: [],
      educationalValue: 8,
      engagementPotential: 8,
    };
  }

  /**
   * Extract title from description
   */
  private extractTitle(description: string): string {
    // Simple extraction - could be improved
    const words = description.split(' ').slice(0, 4);
    return words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .replace(/[^a-zA-Z0-9 ]/g, '');
  }

  /**
   * Extract skills from user request
   */
  private extractSkills(userRequest: string): string[] {
    const skills: string[] = [];
    const lower = userRequest.toLowerCase();

    if (lower.includes('addition')) skills.push('addition');
    if (lower.includes('subtraction')) skills.push('subtraction');
    if (lower.includes('multiplication')) skills.push('multiplication');
    if (lower.includes('division')) skills.push('division');
    if (lower.includes('fractions')) skills.push('fractions');

    return skills.length > 0 ? skills : ['problem-solving'];
  }

  /**
   * Extract learning objectives
   */
  private extractLearningObjectives(userRequest: string): string[] {
    return ['Master core concepts', 'Practice skills through gameplay'];
  }

  /**
   * Build prompt for game generation
   */
  private buildPrompt(concept: GameConcept, context: SkillContext): string {
    return `Create an educational HTML game with the following specifications:

**Title**: ${concept.title}
**Description**: ${concept.description}
**Subject**: ${concept.subject}
**Grade Level**: ${concept.gradeLevel.join(', ')}
**Difficulty**: ${concept.difficulty}
**Estimated Play Time**: ${concept.estimatedPlayTime}

**Learning Objectives**:
${concept.learningObjectives.map((o) => `- ${o}`).join('\n')}

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

Please generate a complete, production-ready HTML file that meets all these requirements.`;
  }

  /**
   * Generate game code (simulated - would call Claude API in production)
   */
  private async generateGameCode(
    prompt: string,
    guidance: string,
    concept: GameConcept
  ): Promise<string> {
    // Check if Claude API is configured
    const { isClaudeConfigured, callClaude } = await import('../../claude-client');

    if (!isClaudeConfigured()) {
      console.warn('⚠️  ANTHROPIC_API_KEY not configured, using mock game template');
      return this.getMockGameTemplate(concept);
    }

    try {
      // Combine skill guidance with specific prompt
      const fullPrompt = `${guidance}

${prompt}

Please create a complete, self-contained HTML file with embedded CSS and JavaScript.
Return ONLY the HTML code, no markdown formatting or explanations.`;

      const gameCode = await callClaude(fullPrompt, {
        model: 'claude-3-7-sonnet-20250219',
        maxTokens: 4000,
        temperature: 1.0,
      });

      // Extract HTML if wrapped in markdown code blocks
      const htmlMatch = gameCode.match(/```html\s*([\s\S]*?)\s*```/);
      if (htmlMatch) {
        return htmlMatch[1].trim();
      }

      // Return as-is if it looks like HTML
      if (gameCode.trim().startsWith('<!DOCTYPE') || gameCode.trim().startsWith('<html')) {
        return gameCode.trim();
      }

      // Fallback to mock if response doesn't look like HTML
      console.warn('⚠️  Claude response does not appear to be valid HTML, using mock template');
      return this.getMockGameTemplate(concept);
    } catch (error) {
      console.error('❌ Error calling Claude API:', error);
      console.warn('⚠️  Falling back to mock game template');
      return this.getMockGameTemplate(concept);
    }
  }

  /**
   * Get mock game template (fallback when API not available)
   */
  private getMockGameTemplate(concept: GameConcept): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${concept.title}</title>
    <meta name="description" content="${concept.description}">
    <style>
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
        h1 {
            color: #667eea;
            text-align: center;
            margin-bottom: 1rem;
        }
        .game-area {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #f5f5f5;
            border-radius: 10px;
            min-height: 300px;
        }
        .score {
            font-size: 1.5rem;
            font-weight: bold;
            color: #764ba2;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="game-container" role="main" aria-label="${concept.title}">
        <h1>${concept.title}</h1>
        <p>${concept.description}</p>

        <div class="score" role="status" aria-live="polite">Score: <span id="score">0</span></div>

        <div class="game-area" role="application" aria-label="Game play area">
            <!-- Game content will be generated here -->
            <p>Game is ready! Click to start.</p>
        </div>
    </div>

    <script>
        // Basic game initialization
        let score = 0;
        const scoreElement = document.getElementById('score');

        function updateScore(points) {
            score += points;
            scoreElement.textContent = score;
        }

        console.log('Game initialized: ${concept.title}');

        // TODO: Add full game logic via Claude API
    </script>
</body>
</html>`;
  }

  /**
   * Generate game ID from title
   */
  private generateGameId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Check for accessibility features in code
   */
  private checkAccessibilityFeatures(code: string): boolean {
    const hasAriaLabels = code.includes('aria-label');
    const hasSemanticHTML =
      code.includes('<main') ||
      code.includes('<nav') ||
      code.includes('<article');
    const hasAltText = !code.includes('<img') || code.includes('alt=');

    return hasAriaLabels || hasSemanticHTML || hasAltText;
  }

  /**
   * Build success message
   */
  private buildSuccessMessage(response: GameBuilderResponse): string {
    return `🎮 Successfully built "${response.metadata.title}"!

**Game Details:**
- File Size: ${(response.technicalSpecs.fileSize / 1024).toFixed(2)} KB
- Lines of Code: ${response.technicalSpecs.lineCount}
- Accessibility Features: ${response.technicalSpecs.hasAccessibilityFeatures ? '✅ Yes' : '⚠️ Limited'}

**Next Steps:**
1. Save the game to \`public/games/${response.gameId}.html\`
2. Test the game in a browser
3. Run accessibility validation
4. Add to catalog when ready

Would you like me to validate accessibility or add this to the catalog?`;
  }
}
