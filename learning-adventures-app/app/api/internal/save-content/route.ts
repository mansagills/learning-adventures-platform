import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, copyFile, readdir } from 'fs/promises';
import { join, resolve, sep, basename, normalize } from 'path';
import { existsSync } from 'fs';
import AdmZip from 'adm-zip';
import { validateIdentifier } from '@/lib/security';
import { extractZipSafely } from '@/lib/safe-zip';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'TEACHER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      content,
      fileName,
      type,
      subscriptionTier = 'free',
      uploadedZipPath,
      uploadSource,
    } = await request.json();

    if (!fileName || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, type' },
        { status: 400 }
      );
    }

    // Security: Prevent path traversal by using basename
    // This ensures fileName is just a filename, not a path
    const safeFileName = basename(fileName);
    if (safeFileName !== fileName) {
      return NextResponse.json(
        { error: 'Invalid file name. Path traversal detected.' },
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
      // SECURITY: Prevent path traversal in uploadedZipPath
      // Ensure path doesn't contain '..', and is within allowed directory
      const normalizedZipPath = normalize(uploadedZipPath).replace(
        /^(\.\.(\/|\\|$))+/,
        ''
      );

      // Strict check: must be in uploads/temp/ and no traversal attempts
      if (
        uploadedZipPath.includes('..') ||
        !normalizedZipPath.startsWith('uploads/temp/')
      ) {
        console.error(`Security Block: Invalid zip path: ${uploadedZipPath}`);
        return NextResponse.json(
          { error: 'Invalid path. Path traversal detected.' },
          { status: 400 }
        );
      }

      // Create directory for the game/lesson
      const gameId = safeFileName.replace('.html', '');
      const gameDir = join(tierDir, gameId);

      // Double check path traversal just in case
      const resolvedTierDir = resolve(tierDir);
      const resolvedGameDir = resolve(gameDir);
      if (
        !resolvedGameDir.startsWith(resolvedTierDir + sep) &&
        resolvedGameDir !== resolvedTierDir
      ) {
        return NextResponse.json(
          { error: 'Invalid game directory path' },
          { status: 400 }
        );
      }

      await mkdir(gameDir, { recursive: true });

      // Prevent path traversal in uploadedZipPath
      const zipFullPath = resolve(
        publicDir,
        uploadedZipPath.replace(/^\//, '')
      );
      if (!zipFullPath.startsWith(publicDir)) {
        return NextResponse.json(
          {
            error: 'Invalid uploadedZipPath. Must be within public directory.',
          },
          { status: 400 }
        );
      }

      if (!existsSync(resolvedZipPath)) {
        return NextResponse.json(
          { error: 'Uploaded zip file not found' },
          { status: 404 }
        );
      }

      const zip = new AdmZip(resolvedZipPath);
      await extractZipSafely(zip, gameDir);

      return NextResponse.json({
        success: true,
        filePath: `/${type}s/${subscriptionTier}/${gameId}/`,
        isDirectory: true,
        message: 'Zip file extracted successfully',
      });
    } else {
      // Handle AI-generated HTML content
      if (!content) {
        return NextResponse.json(
          { error: 'Missing content for AI-generated game' },
          { status: 400 }
        );
      }

      const filePath = join(tierDir, safeFileName);

      // Ensure filePath is safe (though we validated identifier, verify full path)
      const resolvedFilePath = resolve(filePath);
      const resolvedTierDir = resolve(tierDir);

      if (
        !resolvedFilePath.startsWith(resolvedTierDir + sep) &&
        resolvedFilePath !== resolvedTierDir
      ) {
        return NextResponse.json(
          { error: 'Invalid file path' },
          { status: 400 }
        );
      }

      // Write the HTML content to file
      await writeFile(filePath, content, 'utf8');

      return NextResponse.json({
        success: true,
        filePath: `/${type}s/${subscriptionTier}/${safeFileName}`,
        isDirectory: false
      });
    }
  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      {
        error: 'Failed to save content file',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
