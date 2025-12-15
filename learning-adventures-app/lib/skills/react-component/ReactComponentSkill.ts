/**
 * React Component Skill
 * Creates React-based educational games following platform architecture
 */

import { BaseSkill } from '../BaseSkill';
import { SkillMetadata, SkillContext, SkillResult, GameConcept } from '../types';

export class ReactComponentSkill extends BaseSkill {
  public getMetadata(): SkillMetadata {
    return {
      id: 'react-component',
      name: 'React Component Builder',
      description: 'Create React-based educational games with TypeScript',
      triggers: ['react game', 'component', 'typescript game', 'interactive component', 'react', 'tsx'],
      capabilities: ['Generate React components', 'TypeScript support', 'Platform integration', 'State management'],
      examples: ['Create a React game for multiplication', 'Build a React component for fractions'],
      version: '1.0.0',
      guidanceFile: 'SKILL.md',
    };
  }

  public async canHandle(userRequest: string, context?: Partial<SkillContext>): Promise<number> {
    const metadata = this.getMetadata();
    let confidence = this.calculateKeywordConfidence(userRequest, metadata.triggers);

    if (userRequest.toLowerCase().includes('react')) confidence = Math.min(confidence + 25, 100);
    if (userRequest.toLowerCase().includes('html')) confidence = Math.max(confidence - 30, 0);

    return confidence;
  }

  public async execute(context: SkillContext): Promise<SkillResult> {
    const startTime = Date.now();
    try {
      const concept = this.extractGameConcept(context);
      if (!concept) {
        return this.buildErrorResult('Could not determine game specifications', 'MISSING_CONCEPT');
      }

      const code = await this.generateComponentCode(concept);
      if (!this.validate(code)) {
        return this.buildErrorResult('Generated code failed validation', 'VALIDATION_FAILED');
      }

      const response = {
        componentCode: code,
        gameId: this.generateGameId(concept.title),
        metadata: concept,
        dependencies: ['react', '@types/react'],
      };

      return this.buildSuccessResult(response, 'React component created successfully', Date.now() - startTime, 90, ['accessibility-validator', 'metadata-formatter']);
    } catch (error) {
      return this.buildErrorResult(`Execution failed: ${error}`, 'EXECUTION_ERROR', error);
    }
  }

  protected validate(code: string): boolean {
    return code.includes('export') && code.includes('function') && code.length > 100;
  }

  private extractGameConcept(context: SkillContext): GameConcept | null {
    if (context.previousOutputs?.has('game-ideation')) {
      const output = context.previousOutputs.get('game-ideation');
      if (Array.isArray(output) && output.length > 0) return output[0];
    }
    const parsed = this.parseRequest(context.userRequest);
    if (!parsed.subject) return null;

    return {
      title: 'React Game',
      description: context.userRequest,
      subject: parsed.subject,
      gradeLevel: parsed.gradeLevel || ['3'],
      skills: ['problem-solving'],
      learningObjectives: ['Master concepts'],
      estimatedTime: '10-15 minutes',
      difficulty: parsed.difficulty || 'medium',
      gameplayMechanics: [],
      educationalValue: 8,
      engagementPotential: 8,
    };
  }

  private generateGameId(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  private async generateComponentCode(concept: GameConcept): Promise<string> {
    return `'use client';

import { useState } from 'react';

export default function ${concept.title.replace(/[^a-zA-Z0-9]/g, '')}() {
  const [score, setScore] = useState(0);

  return (
    <div className="game-container">
      <h1>${concept.title}</h1>
      <p>${concept.description}</p>
      <div className="score">Score: {score}</div>
    </div>
  );
}`;
  }
}
