/**
 * Metadata Formatter Skill
 * Format game metadata for catalog integration
 */

import { BaseSkill } from '../BaseSkill';
import { SkillMetadata, SkillContext, SkillResult, CatalogEntry } from '../types';

export class MetadataFormatterSkill extends BaseSkill {
  public getMetadata(): SkillMetadata {
    return {
      id: 'metadata-formatter',
      name: 'Metadata Formatter',
      description: 'Format game metadata for catalog integration',
      triggers: ['format metadata', 'catalog entry', 'add to catalog', 'publish game', 'metadata'],
      capabilities: ['Generate catalog entries', 'Validate metadata', 'Format for integration'],
      examples: ['Format metadata for the math game', 'Add this game to the catalog'],
      version: '1.0.0',
      guidanceFile: 'SKILL.md',
    };
  }

  public async canHandle(userRequest: string, context?: Partial<SkillContext>): Promise<number> {
    const metadata = this.getMetadata();
    let confidence = this.calculateKeywordConfidence(userRequest, metadata.triggers);

    if (userRequest.toLowerCase().includes('catalog') || userRequest.toLowerCase().includes('metadata')) {
      confidence = Math.min(confidence + 20, 100);
    }

    return confidence;
  }

  public async execute(context: SkillContext): Promise<SkillResult> {
    const startTime = Date.now();
    try {
      const catalogEntry = this.generateCatalogEntry(context);
      if (!this.validate(catalogEntry)) {
        return this.buildErrorResult('Invalid catalog entry', 'VALIDATION_FAILED');
      }

      return this.buildSuccessResult(catalogEntry, 'Catalog entry created successfully', Date.now() - startTime);
    } catch (error) {
      return this.buildErrorResult(`Execution failed: ${error}`, 'EXECUTION_ERROR', error);
    }
  }

  protected validate(entry: CatalogEntry): boolean {
    return !!(entry.id && entry.title && entry.description && entry.category);
  }

  private generateCatalogEntry(context: SkillContext): CatalogEntry {
    const parsed = this.parseRequest(context.userRequest);
    const id = 'game-' + Date.now();

    return {
      id,
      title: 'Educational Game',
      description: context.userRequest,
      category: parsed.subject || 'Math',
      type: 'game',
      gradeLevel: parsed.gradeLevel || ['3'],
      difficulty: parsed.difficulty || 'medium',
      skills: ['problem-solving'],
      estimatedTime: '10-15 minutes',
      featured: false,
      targetArray: 'mathGames',
      codeSnippet: `{\n  id: '${id}',\n  title: 'Educational Game'\n}`,
    };
  }
}
