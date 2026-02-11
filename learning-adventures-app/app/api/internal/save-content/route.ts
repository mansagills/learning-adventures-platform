import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, copyFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import AdmZip from 'adm-zip';
import { extractZipSafely } from '@/lib/safe-zip';

export async function POST(request: NextRequest) {
  try {
    const {
      content,
      fileName,
      type,
      subscriptionTier = 'free',
      uploadedZipPath,
      uploadSource
    } = await request.json();

    if (!fileName || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, type' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!['game', 'lesson'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "game" or "lesson"' },
        { status: 400 }
      );
    }

    // Validate subscription tier
    const validTiers = ['free', 'premium', 'custom', 'course'];
    if (!validTiers.includes(subscriptionTier)) {
      return NextResponse.json(
        { error: `Invalid tier. Must be one of: ${validTiers.join(', ')}` },
        { status: 400 }
      );
    }

    const publicDir = join(process.cwd(), 'public');
    const typeDir = join(publicDir, `${type}s`);
    const tierDir = join(typeDir, subscriptionTier);

    // Ensure tier directory exists
    if (!existsSync(tierDir)) {
      await mkdir(tierDir, { recursive: true });
    }

    // Handle uploaded zip files
    if (uploadSource === 'uploaded' && uploadedZipPath) {
      // Create directory for the game/lesson
      const gameId = fileName.replace('.html', '');
      const gameDir = join(tierDir, gameId);
      await mkdir(gameDir, { recursive: true });

      // Extract zip to the game directory
      const zipFullPath = join(publicDir, uploadedZipPath.replace(/^\//, ''));

      if (!existsSync(zipFullPath)) {
        return NextResponse.json(
          { error: 'Uploaded zip file not found' },
          { status: 404 }
        );
      }

      const zip = new AdmZip(zipFullPath);
      await extractZipSafely(zip, gameDir);

      return NextResponse.json({
        success: true,
        filePath: `/${type}s/${subscriptionTier}/${gameId}/`,
        isDirectory: true,
        message: 'Zip file extracted successfully'
      });

    } else {
      // Handle AI-generated HTML content
      if (!content) {
        return NextResponse.json(
          { error: 'Missing content for AI-generated game' },
          { status: 400 }
        );
      }

      const filePath = join(tierDir, fileName);

      // Write the HTML content to file
      await writeFile(filePath, content, 'utf8');

      return NextResponse.json({
        success: true,
        filePath: `/${type}s/${subscriptionTier}/${fileName}`,
        isDirectory: false
      });
    }

  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Failed to save content file', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
