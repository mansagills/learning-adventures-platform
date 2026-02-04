import AdmZip from 'adm-zip';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';
import { extractMetadata } from './metadataExtractor';
import { validateIdentifier } from '@/lib/security';

interface GameManifest {
  id: string;
  title: string;
  description: string;
  category: string; // 'math', 'science', etc.
  type: 'game' | 'lesson';
  gradeLevel: string[];
  difficulty: string;
  skills: string[];
  estimatedTime: string;
  gameFile: string; // The HTML file name in the ZIP
}

interface ProcessGameResult {
  success: boolean;
  testGameId?: string;
  gameId?: string;
  stagingPath?: string;
  error?: string;
}

/**
 * Process a game package (.zip file) and create TestGame entry in staging
 * @param zipFile - The uploaded .zip File object
 * @param uploaderId - User ID of the admin uploading
 * @returns Object with testGameId, gameId, and staging path
 */
export async function processGamePackage(
  zipFile: File,
  uploaderId: string
): Promise<ProcessGameResult> {
  // Extract .zip
  const buffer = Buffer.from(await zipFile.arrayBuffer());
  const zip = new AdmZip(buffer);

  // Find metadata.json
  const manifestEntry = zip.getEntry('metadata.json');
  if (!manifestEntry) {
    throw new Error('metadata.json not found in .zip package');
  }

  const manifest: GameManifest = JSON.parse(
    manifestEntry.getData().toString('utf8')
  );

  // Validate manifest
  if (!manifest.title || !manifest.gameFile) {
    throw new Error('Invalid manifest: missing title or gameFile');
  }

  // Find the game HTML file
  const gameEntry = zip.getEntry(manifest.gameFile);
  if (!gameEntry) {
    throw new Error(`Game file not found: ${manifest.gameFile}`);
  }

  // Generate unique game ID if not provided
  let gameId = manifest.id || generateGameId(manifest.title);

  // Sanitize gameId to prevent path traversal (Critical Security Fix)
  gameId = sanitizeId(gameId);

  // Validate game ID to prevent path traversal
  validateIdentifier(gameId, 'Game ID');

  // Check if game already exists in TestGame
  const existing = await prisma.testGame.findUnique({
    where: { gameId }
  });

  if (existing) {
    throw new Error(`Game with ID "${gameId}" already exists in staging`);
  }

  // Create staging directory path
  const stagingDir = path.join(process.cwd(), 'public', 'staging', 'games');
  const gameFileName = `${gameId}.html`;
  const stagingFilePath = path.join(stagingDir, gameFileName);

  // Ensure staging directory exists
  await fs.mkdir(stagingDir, { recursive: true });

  // Extract and save the game file to staging
  const gameData = gameEntry.getData();
  await fs.writeFile(stagingFilePath, gameData);

  // Try to extract additional metadata from HTML if available
  let htmlMetadata = null;
  try {
    const htmlContent = gameData.toString('utf8');
    htmlMetadata = await extractMetadata(htmlContent, 'html');
  } catch {
    // Metadata extraction from HTML is optional
  }

  // Merge manifest with HTML metadata (manifest takes precedence)
  const finalMetadata = {
    title: manifest.title || htmlMetadata?.title || 'Untitled Game',
    description: manifest.description || htmlMetadata?.description || '',
    category: manifest.category || htmlMetadata?.subject || 'interdisciplinary',
    type: manifest.type || htmlMetadata?.type || 'game',
    gradeLevel: manifest.gradeLevel || htmlMetadata?.gradeLevel || ['3'],
    difficulty: manifest.difficulty || htmlMetadata?.difficulty || 'medium',
    skills: manifest.skills || htmlMetadata?.skills || [],
    estimatedTime: manifest.estimatedTime || htmlMetadata?.estimatedTime || '15-20 mins',
  };

  // Create TestGame entry
  const testGame = await prisma.testGame.create({
    data: {
      gameId,
      title: finalMetadata.title,
      description: finalMetadata.description,
      category: finalMetadata.category,
      type: finalMetadata.type,
      gradeLevel: finalMetadata.gradeLevel,
      difficulty: finalMetadata.difficulty,
      skills: finalMetadata.skills,
      estimatedTime: finalMetadata.estimatedTime,
      filePath: `/staging/games/${gameFileName}`,
      isHtmlGame: true,
      isReactComponent: false,
      createdBy: uploaderId,
      status: 'NOT_TESTED',
    }
  });

  return {
    success: true,
    testGameId: testGame.id,
    gameId: testGame.gameId,
    stagingPath: `/staging/games/${gameFileName}`,
  };
}

/**
 * Generate a URL-safe game ID from title
 */
function generateGameId(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Sanitize ID to prevent path traversal
 * Allows only alphanumeric characters, hyphens, and underscores
 */
function sanitizeId(id: string): string {
  return id
    .replace(/[^a-zA-Z0-9\-_]/g, '')
    .trim();
}

/**
 * Determine if a ZIP file is a game package or course package
 * Game ZIPs have a single HTML file, Course ZIPs have multiple lessons
 */
export function isGamePackage(zip: AdmZip): boolean {
  const manifest = zip.getEntry('metadata.json');
  if (!manifest) return false;

  try {
    const data = JSON.parse(manifest.getData().toString('utf8'));
    // If it has 'gameFile' field, it's a game package
    // If it has 'lessons' array, it's a course package
    return !!data.gameFile && !data.lessons;
  } catch {
    return false;
  }
}

/**
 * Validate game package structure before processing
 */
export function validateGamePackage(zip: AdmZip): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for metadata.json
  const manifest = zip.getEntry('metadata.json');
  if (!manifest) {
    errors.push('Missing metadata.json file');
    return { valid: false, errors };
  }

  let manifestData: GameManifest;
  try {
    manifestData = JSON.parse(manifest.getData().toString('utf8'));
  } catch {
    errors.push('Invalid JSON in metadata.json');
    return { valid: false, errors };
  }

  // Required fields
  if (!manifestData.title) errors.push('Missing required field: title');
  if (!manifestData.gameFile) errors.push('Missing required field: gameFile');

  // Check if game file exists in ZIP
  if (manifestData.gameFile) {
    const gameFile = zip.getEntry(manifestData.gameFile);
    if (!gameFile) {
      errors.push(`Game file not found in ZIP: ${manifestData.gameFile}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
