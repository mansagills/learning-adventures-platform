import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path, { join, resolve } from 'path';
import AdmZip from 'adm-zip';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface ExtractedMetadata {
  title?: string;
  description?: string;
  type?: 'game' | 'lesson';
  category?: 'math' | 'science' | 'english' | 'history';
  gradeLevel?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  skills?: string[];
  estimatedTime?: string;
  platform?: string;
  sourceCodeUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);

    if (!session || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin or Teacher role required.' },
        { status: 403 }
      );
    }

    const { zipPath } = await request.json();

    if (!zipPath) {
      return NextResponse.json(
        { error: 'zipPath is required' },
        { status: 400 }
      );
    }

    // Convert relative path to absolute path
    const publicDir = join(process.cwd(), 'public');
    // Normalize path to prevent directory traversal
    const normalizedZipPath = path.normalize(zipPath).replace(/^(\.\.(\/|\\|$))+/, '');

    // Check for ".." manually as well to be completely safe against variations
    if (zipPath.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid path. Path traversal detected.' },
        { status: 400 }
      );
    }

    // Ensure absolute path inputs like "/etc/passwd" do not bypass resolve by stripping the leading slash,
    // but better yet, resolve from publicDir, then check path properly.
    // If someone passes an absolute path, we can either reject it or treat it as relative to publicDir.
    // Given the endpoint likely expects relative paths within public, let's treat it as relative to public
    // by removing leading slashes.
    // However, if we simply remove leading slashes, path.resolve(publicDir, 'etc/passwd')
    // becomes /app/public/etc/passwd which is "within public directory".
    // Is that acceptable? The user is restricted to the public directory.
    // Let's ensure that if they supply an absolute path, it is strictly checked or just rely on the '..' check + startswith public.
    const fullPath = resolve(publicDir, normalizedZipPath.replace(/^[\/\\]+/, ''));

    // Ensure the resolved path is within the public directory
    if (!fullPath.startsWith(publicDir + path.sep) && fullPath !== publicDir) {
      return NextResponse.json(
        { error: 'Invalid path. Must be within public directory.' },
        { status: 400 }
      );
    }

    // Read the zip file
    const zip = new AdmZip(fullPath);
    const zipEntries = zip.getEntries();

    // Look for metadata.json in the root or common locations
    let metadataEntry = zipEntries.find(
      (entry) =>
        entry.entryName === 'metadata.json' ||
        entry.entryName === 'game-metadata.json' ||
        entry.entryName === 'config/metadata.json'
    );

    // Check if it's a React/Next.js project
    const hasPackageJson = zipEntries.some(
      (entry) => entry.entryName === 'package.json'
    );
    const hasNextConfig = zipEntries.some((entry) =>
      entry.entryName.includes('next.config')
    );
    const hasPublicFolder = zipEntries.some((entry) =>
      entry.entryName.startsWith('public/')
    );
    const hasIndexHtml = zipEntries.some(
      (entry) =>
        entry.entryName === 'index.html' ||
        entry.entryName.includes('/index.html')
    );

    // Determine project type
    let projectType: 'html' | 'react-nextjs' = 'html';
    if (hasPackageJson || hasNextConfig) {
      projectType = 'react-nextjs';
    }

    // Find entry point
    let entryPoint = 'index.html';
    if (projectType === 'react-nextjs') {
      // For React/Next.js, we'll use the build output or public folder
      const buildIndex = zipEntries.find(
        (entry) =>
          entry.entryName === 'out/index.html' ||
          entry.entryName === 'build/index.html' ||
          entry.entryName === 'dist/index.html'
      );
      if (buildIndex) {
        entryPoint = buildIndex.entryName;
      }
    } else {
      // For HTML projects, find the main index.html
      const htmlEntry = zipEntries.find(
        (entry) =>
          entry.entryName === 'index.html' ||
          entry.entryName.endsWith('/index.html')
      );
      if (htmlEntry) {
        entryPoint = htmlEntry.entryName;
      }
    }

    let extractedMetadata: ExtractedMetadata = {};

    // Extract metadata if found
    if (metadataEntry) {
      const metadataContent = metadataEntry.getData().toString('utf8');
      extractedMetadata = JSON.parse(metadataContent);
    }

    // List all files for debugging
    const fileList = zipEntries
      .map((entry) => ({
        name: entry.entryName,
        size: entry.header.size,
        isDirectory: entry.isDirectory,
      }))
      .filter((file) => !file.isDirectory);

    return NextResponse.json({
      success: true,
      metadata: extractedMetadata,
      projectType,
      entryPoint,
      hasMetadata: !!metadataEntry,
      fileCount: fileList.length,
      totalSize: fileList.reduce((sum, file) => sum + file.size, 0),
      files: fileList.slice(0, 20), // Return first 20 files for preview
      projectInfo: {
        hasPackageJson,
        hasNextConfig,
        hasPublicFolder,
        hasIndexHtml,
      },
    });
  } catch (error) {
    console.error('Extract metadata error:', error);
    return NextResponse.json(
      {
        error: 'Failed to extract metadata',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
