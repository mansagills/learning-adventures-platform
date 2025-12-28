import { JSDOM } from 'jsdom';
import { Difficulty } from '@prisma/client';

interface ExtractedMetadata {
  title: string;
  description: string;
  type: 'game' | 'lesson';
  subject: string;
  gradeLevel: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  skills: string[];
  estimatedTime: string;
  featured: boolean;
}

/**
 * Extract metadata from HTML content or JSON
 * @param content - HTML string or JSON string
 * @param format - 'html' or 'json'
 * @returns Extracted metadata object
 */
export async function extractMetadata(
  content: string,
  format: 'html' | 'json'
): Promise<ExtractedMetadata> {
  if (format === 'html') {
    return extractHtmlMetadata(content);
  } else {
    return JSON.parse(content);
  }
}

/**
 * Extract metadata from HTML meta tags
 * @param htmlContent - The HTML file content as string
 * @returns Extracted metadata
 */
function extractHtmlMetadata(htmlContent: string): ExtractedMetadata {
  const dom = new JSDOM(htmlContent);
  const document = dom.window.document;

  const getMeta = (name: string) =>
    document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') || '';

  return {
    title: getMeta('title') || document.querySelector('title')?.textContent || 'Untitled',
    description: getMeta('description') || '',
    type: (getMeta('content-type') as 'game' | 'lesson') || 'game',
    subject: getMeta('subject') || 'interdisciplinary',
    gradeLevel: getMeta('grade-level')?.split(',').map(g => g.trim()) || ['3'],
    difficulty: (getMeta('difficulty') as 'easy' | 'medium' | 'hard') || 'medium',
    skills: getMeta('skills')?.split(',').map(s => s.trim()) || [],
    estimatedTime: getMeta('estimated-time') || '15-20 mins',
    featured: getMeta('featured') === 'true',
  };
}

/**
 * Convert difficulty string to Prisma enum
 * @param difficulty - 'easy', 'medium', or 'hard'
 * @returns Prisma Difficulty enum value
 */
export function mapDifficultyToPrisma(difficulty: 'easy' | 'medium' | 'hard'): Difficulty {
  const mapping: Record<string, Difficulty> = {
    easy: 'BEGINNER',
    medium: 'INTERMEDIATE',
    hard: 'ADVANCED',
  };
  return mapping[difficulty] || 'INTERMEDIATE';
}
