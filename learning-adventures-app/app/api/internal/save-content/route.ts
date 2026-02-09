import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join, resolve, dirname, sep } from 'path';
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
      uploadSource,
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

    // Sanitize fileName to prevent path traversal
    // We expect fileName to be safe. If it contains path separators, validateIdentifier will catch it
    // if we strip the extension first.
    let identifier = fileName;
    if (fileName.endsWith('.html')) {
      identifier = fileName.slice(0, -5);
    }

    try {
      validateIdentifier(identifier, 'File Name');
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
      const gameId = identifier;
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

      // Extract zip to the game directory
      // Sanitize uploadedZipPath
      const safeZipPath = join(publicDir, uploadedZipPath.replace(/^\//, ''));
      const resolvedZipPath = resolve(safeZipPath);
      const resolvedPublicDir = resolve(publicDir);

      // Verify that the resolved path is inside the public directory
      if (
        !resolvedZipPath.startsWith(resolvedPublicDir + sep) &&
        resolvedZipPath !== resolvedPublicDir
      ) {
        return NextResponse.json(
          { error: 'Invalid zip path: Path traversal detected' },
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
      // Securely extract zip entries preventing Zip Slip
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        const entryName = entry.entryName;
        const targetPath = join(gameDir, entryName);
        const resolvedTargetPath = resolve(targetPath);

        // Check for Zip Slip
        if (
          !resolvedTargetPath.startsWith(resolvedGameDir + sep) &&
          resolvedTargetPath !== resolvedGameDir
        ) {
          console.warn(`Blocked unsafe zip entry extraction: ${entryName}`);
          continue;
        }

        if (entry.isDirectory) {
          await mkdir(resolvedTargetPath, { recursive: true });
        } else {
          await mkdir(dirname(resolvedTargetPath), { recursive: true });
          await writeFile(resolvedTargetPath, entry.getData());
        }
      }

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
