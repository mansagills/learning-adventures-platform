/**
 * Metadata Formatter Agent
 * Formats game metadata for catalog integration using the catalog-metadata-formatter skill
 */

import { BaseAgent } from './BaseAgent';
import {
  AgentResult,
  GameFile,
  GameConcept,
  CatalogEntry,
} from './types';

// TODO: Move these types to ./types.ts
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

interface MetadataFormatterResponse {
  catalogEntry: CatalogEntry;
  targetArray: string;
  validation: ValidationResult;
}

export class MetadataFormatterAgent extends BaseAgent {
  constructor() {
    super(
      'metadata-formatter',
      ['docs/skills/catalog-metadata-formatter/SKILL.md'],
      'You are a metadata formatter agent. Format game metadata for catalog integration.'
    );
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
      const targetArray = this.determineTargetArray(concept.subject, (concept as any).type || 'game');

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
    const id = this.generateContentId(concept.title);

    const entry: CatalogEntry = {
      id,
      title: concept.title,
      description: concept.description,
      type: 'game',
      category: concept.subject,
      gradeLevel: this.parseGradeLevel(concept.gradeLevel),
      difficulty: concept.difficulty,
      skills: concept.skills,
      estimatedTime: concept.estimatedTime,
      featured: false, // New games start as not featured
      htmlPath: format === 'html' ? (filePath || `/games/${id}.html`) : undefined,
      reactPath: format === 'react' ? `components/games/${id}` : undefined,
    };

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
    if (!entry.htmlPath && !entry.reactPath) {
      errors.push('Must have either htmlPath or reactPath');
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

    // Learning objectives are not part of CatalogEntry schema
    // if (entry.learningObjectives && entry.learningObjectives.length === 0) {
    //   warnings.push('No learning objectives specified');
    // }

    // estimatedTime is a string in CatalogEntry, so we can't do numeric comparison
    // if (entry.estimatedTime && (entry.estimatedTime < 5 || entry.estimatedTime > 60)) {
    //   warnings.push('Estimated time outside typical range (5-60 minutes)');
    // }

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
  protected validate(output: any): boolean {
    const response = output as MetadataFormatterResponse;

    if (!response.catalogEntry) {
      return false;
    }

    if (!response.targetArray) {
      return false;
    }

    // Use the catalog entry validation
    return response.validation.valid;
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
${indent}estimatedTime: '${entry.estimatedTime}',
${indent}featured: ${entry.featured},
${entry.htmlPath ? `${indent}htmlPath: '${entry.htmlPath}',` : ''}
${entry.reactPath ? `${indent}reactPath: '${entry.reactPath}',` : ''}
}`;
  }

  /**
   * Utility methods
   */
  private generateContentId(title: string): string {
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
