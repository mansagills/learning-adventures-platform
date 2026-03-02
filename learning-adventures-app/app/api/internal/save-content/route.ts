import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, copyFile, readdir } from 'fs/promises';
import { join, resolve, sep, basename } from 'path';
import { existsSync } from 'fs';
import AdmZip from 'adm-zip';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Teacher role required.' },
        { status: 403 }
      );
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

    // Security: Validate fileName (path traversal prevention)
    const safeFileName = basename(fileName);
    if (fileName !== safeFileName || !/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      return NextResponse.json(
        { error: 'Invalid filename. Only alphanumeric, dots, underscores, and hyphens are allowed.' },
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
      // Security: Validate uploadedZipPath to prevent path traversal
      if (uploadedZipPath.includes('..') || !uploadedZipPath.startsWith('/uploads/temp/')) {
        return NextResponse.json(
          { error: 'Invalid zip path. Must be a relative path in /uploads/temp/' },
          { status: 400 }
        );
      }

      // Create directory for the game/lesson
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

      // Security: double check that fileName is safe (already checked for separators above)
      if (fileName !== basename(fileName)) {
        return NextResponse.json(
          { error: 'Invalid filename: must be a base filename' },
          { status: 400 }
        );
      }

      const filePath = join(tierDir, fileName);

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
        filePath: `/${type}s/${subscriptionTier}/${fileName}`,
        isDirectory: false,
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
