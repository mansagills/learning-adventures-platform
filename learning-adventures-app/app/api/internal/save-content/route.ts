import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, copyFile, readdir } from 'fs/promises';
import { join, dirname, normalize } from 'path';
import { existsSync } from 'fs';
import AdmZip from 'adm-zip';

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
      // SECURITY: Prevent path traversal in uploadedZipPath
      // Ensure path doesn't contain '..', and is within allowed directory
      const normalizedZipPath = normalize(uploadedZipPath).replace(/^(\.\.(\/|\\|$))+/, '');

      // Strict check: must be in uploads/temp/ and no traversal attempts
      if (uploadedZipPath.includes('..') || !normalizedZipPath.startsWith('uploads/temp/')) {
         console.error(`Security Block: Invalid zip path: ${uploadedZipPath}`);
         return NextResponse.json(
           { error: 'Invalid path. Path traversal detected.' },
           { status: 400 }
         );
      }

      // Create directory for the game/lesson
      const gameId = fileName.replace('.html', '');
      const gameDir = join(tierDir, gameId);
      await mkdir(gameDir, { recursive: true });

      // Extract zip to the game directory
      const zipFullPath = join(publicDir, normalizedZipPath);

      if (!existsSync(zipFullPath)) {
        return NextResponse.json(
          { error: 'Uploaded zip file not found' },
          { status: 404 }
        );
      }

      const zip = new AdmZip(zipFullPath);

      // SECURITY: Secure extraction to prevent Zip Slip
      // Instead of zip.extractAllTo(gameDir, true), we manually extract and verify paths
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
          // Check for malicious paths in entry name
          if (entry.entryName.includes('..')) {
             throw new Error(`Security Violation: Zip Slip detected in entry ${entry.entryName}`);
          }

          const fullDestPath = join(gameDir, entry.entryName);
          const normalizedDestPath = normalize(fullDestPath);

          // Ensure the destination is still within the gameDir
          if (!normalizedDestPath.startsWith(gameDir)) {
              throw new Error(`Security Violation: Zip Slip detected in entry ${entry.entryName}`);
          }

          if (entry.isDirectory) {
             await mkdir(normalizedDestPath, { recursive: true });
          } else {
             await mkdir(dirname(normalizedDestPath), { recursive: true });
             await writeFile(normalizedDestPath, entry.getData());
          }
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
