/**
 * Metadata Formatter Agent
 * Formats game metadata for catalog integration using the catalog-metadata-formatter skill
 */

import { BaseAgent } from './BaseAgent';
import {
  AgentResult,
  MetadataFormatterResponse,
  GameFile,
  GameConcept,
  CatalogEntry,
  ValidationResult,
} from './types';

export class MetadataFormatterAgent extends BaseAgent {
  constructor() {
    super({
      type: 'metadata-formatter',
      skillPaths: ['skills/catalog-metadata-formatter/SKILL.md'],
      maxRetries: 2,
      timeout: 60000, // 1 minute
      validateOutput: true,
    });
  }

  /**
   * Execute metadata formatting task
   */
  async execute(input: { game: GameFile } | { concept: GameConcept; format: 'html' | 'react' }): Promise<AgentResult> {
    try {
      // Load skills
      await this.loadSkills();

      let concept: GameConcept;
      let format: 'html' | 'react';
      let filePath: string | undefined;

      // Handle two input types
      if ('game' in input) {
        concept = input.game.metadata;
        format = input.game.format;
        filePath = input.game.path;
      } else {
        concept = input.concept;
        format = input.format;
      }

      // Generate catalog entry
      const catalogEntry = this.generateCatalogEntry(concept, format, filePath);

      // Determine target array
      const targetArray = this.determineTargetArray(concept.subject, concept.type || 'game');

      // Validate the entry
      const validation = this.validateCatalogEntry(catalogEntry);

      const response: MetadataFormatterResponse = {
        catalogEntry,
        targetArray,
        validation,
      };

      return {
        success: validation.valid,
        output: response,
        errors: validation.errors,
        warnings: validation.warnings,
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
   * Generate catalog entry from game concept
   */
  private generateCatalogEntry(
    concept: GameConcept,
    format: 'html' | 'react',
    filePath?: string
  ): CatalogEntry {
    const id = this.generateId(concept.title);

    const entry: CatalogEntry = {
      id,
      title: concept.title,
      description: concept.description,
      type: 'game',
      category: concept.subject,
      gradeLevel: this.parseGradeLevel(concept.gradeLevel),
      difficulty: concept.difficulty,
      skills: concept.skills,
      learningObjectives: concept.learningObjectives,
      estimatedTime: concept.estimatedTime,
      featured: false, // New games start as not featured
    };

    // Add path based on format
    if (format === 'html') {
      entry.htmlPath = filePath || `/games/${id}.html`;
    } else {
      entry.componentPath = `components/games/${id}`;
    }

    return entry;
  }

  /**
   * Determine which catalog array this entry belongs to
   */
  private determineTargetArray(
    subject: string,
    type: 'game' | 'lesson' | 'activity'
  ): string {
    const subjectMap: Record<string, string> = {
      math: 'math',
      science: 'science',
      english: 'english',
      history: 'history',
      interdisciplinary: 'interdisciplinary',
    };

    const typeMap: Record<string, string> = {
      game: 'Games',
      lesson: 'Lessons',
      activity: 'Activities',
    };

    const subjectKey = subjectMap[subject.toLowerCase()] || 'math';
    const typeKey = typeMap[type.toLowerCase()] || 'Games';

    // Format: mathGames, scienceLessons, etc.
    return `${subjectKey}${typeKey}`;
  }

  /**
   * Validate catalog entry against schema
   */
  private validateCatalogEntry(entry: CatalogEntry): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!entry.id) errors.push('Missing required field: id');
    if (!entry.title) errors.push('Missing required field: title');
    if (!entry.description) errors.push('Missing required field: description');
    if (!entry.type) errors.push('Missing required field: type');
    if (!entry.category) errors.push('Missing required field: category');
    if (!entry.gradeLevel || entry.gradeLevel.length === 0) {
      errors.push('Missing required field: gradeLevel');
    }
    if (!entry.difficulty) errors.push('Missing required field: difficulty');
    if (!entry.skills || entry.skills.length === 0) {
      errors.push('Missing required field: skills');
    }
    if (!entry.estimatedTime) errors.push('Missing required field: estimatedTime');

    // Path validation
    if (!entry.htmlPath && !entry.componentPath) {
      errors.push('Must have either htmlPath or componentPath');
    }

    // Field validation
    if (entry.title && entry.title.length > 100) {
      warnings.push('Title is longer than 100 characters');
    }

    if (entry.description && entry.description.length < 50) {
      warnings.push('Description is shorter than 50 characters (recommended minimum)');
    }

    if (entry.description && entry.description.length > 500) {
      warnings.push('Description is longer than 500 characters');
    }

    if (entry.skills && entry.skills.length === 0) {
      warnings.push('No skills specified');
    }

    if (entry.learningObjectives && entry.learningObjectives.length === 0) {
      warnings.push('No learning objectives specified');
    }

    if (entry.estimatedTime && (entry.estimatedTime < 5 || entry.estimatedTime > 60)) {
      warnings.push('Estimated time outside typical range (5-60 minutes)');
    }

    // Type validation
    const validTypes = ['game', 'lesson', 'activity'];
    if (entry.type && !validTypes.includes(entry.type)) {
      errors.push(`Invalid type: ${entry.type}. Must be one of: ${validTypes.join(', ')}`);
    }

    const validCategories = ['math', 'science', 'english', 'history', 'interdisciplinary'];
    if (entry.category && !validCategories.includes(entry.category)) {
      errors.push(`Invalid category: ${entry.category}. Must be one of: ${validCategories.join(', ')}`);
    }

    const validDifficulties = ['easy', 'medium', 'hard'];
    if (entry.difficulty && !validDifficulties.includes(entry.difficulty)) {
      errors.push(`Invalid difficulty: ${entry.difficulty}. Must be one of: ${validDifficulties.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate against full catalog entry schema
   */
  protected validate(output: any): ValidationResult {
    const response = output as MetadataFormatterResponse;

    if (!response.catalogEntry) {
      return {
        valid: false,
        errors: ['No catalog entry generated'],
        warnings: [],
      };
    }

    if (!response.targetArray) {
      return {
        valid: false,
        errors: ['No target array determined'],
        warnings: [],
      };
    }

    // Use the catalog entry validation
    return response.validation;
  }

  /**
   * Generate catalog entry code snippet
   */
  generateCodeSnippet(entry: CatalogEntry): string {
    const indent = '  ';

    return `{
${indent}id: '${entry.id}',
${indent}title: '${entry.title}',
${indent}description: '${entry.description}',
${indent}type: '${entry.type}',
${indent}category: '${entry.category}',
${indent}gradeLevel: ${JSON.stringify(entry.gradeLevel)},
${indent}difficulty: '${entry.difficulty}',
${indent}skills: ${JSON.stringify(entry.skills)},
${indent}learningObjectives: ${JSON.stringify(entry.learningObjectives)},
${indent}estimatedTime: ${entry.estimatedTime},
${indent}featured: ${entry.featured},
${entry.htmlPath ? `${indent}htmlPath: '${entry.htmlPath}',` : ''}
${entry.componentPath ? `${indent}componentPath: '${entry.componentPath}',` : ''}
}`;
  }

  /**
   * Utility methods
   */
  private generateId(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private parseGradeLevel(gradeLevel: string): string[] {
    // Convert formats like "3-5", "K-2", "6" to array format
    if (gradeLevel.includes('-')) {
      return [gradeLevel]; // e.g., "3-5", "K-2"
    }

    // Single grade
    return [gradeLevel];
  }
}
