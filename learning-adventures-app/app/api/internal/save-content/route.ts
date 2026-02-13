import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, copyFile, readdir } from 'fs/promises';
import { join, resolve, sep } from 'path';
import { existsSync } from 'fs';
import AdmZip from 'adm-zip';
import { validateIdentifier } from '@/lib/security';

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

    // Validate fileName/gameId to prevent path traversal
    // We derive gameId by stripping .html extension, effectively enforcing it
    const gameId = fileName.replace('.html', '');
    try {
      validateIdentifier(gameId, 'Game ID');
    } catch (e) {
      return NextResponse.json(
        { error: (e as Error).message },
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

      // Security: Manually extract zip entries to prevent Zip Slip vulnerabilities
      const zipEntries = zip.getEntries();
      const resolvedTargetDir = resolve(gameDir);

      for (const entry of zipEntries) {
        if (entry.isDirectory) continue;

        // Resolve full path and prevent path traversal
        const entryName = entry.entryName;
        const fullPath = resolve(resolvedTargetDir, entryName);

        // Ensure the resolved path is inside the target directory
        if (!fullPath.startsWith(resolvedTargetDir + sep)) {
          console.warn(
            `Security Warning: Skipped file trying to escape target directory: ${entryName}`
          );
          continue;
        }

        // Ensure parent directory exists
        const parentDir = resolve(fullPath, '..');
        await mkdir(parentDir, { recursive: true });

        // Write file content
        await writeFile(fullPath, entry.getData());
      }

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
