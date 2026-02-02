import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

interface PublishRequest {
  contentId: string;
  destination: 'catalog' | 'test-games';
  metadata: {
    title: string;
    description: string;
    featured?: boolean;
    estimatedTime?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse request
    const body: PublishRequest = await req.json();
    const { contentId, destination, metadata } = body;

    // 3. Validate inputs
    if (
      !contentId ||
      !destination ||
      !metadata ||
      !metadata.title ||
      !metadata.description
    ) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: contentId, destination, metadata.title, metadata.description',
        },
        { status: 400 }
      );
    }

    // 4. Fetch content
    const content = await prisma.geminiContent.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // 5. Generate unique filename
    const filename = generateUniqueFilename(metadata.title, content.category);
    const filePath = `/games/${filename}.html`;

    // 6. Save file to public directory
    const publicPath = path.join(
      process.cwd(),
      'public',
      'games',
      `${filename}.html`
    );

    // Ensure directory exists
    await fs.mkdir(path.dirname(publicPath), { recursive: true });

    // Write file
    await fs.writeFile(publicPath, content.generatedCode, 'utf-8');

    if (destination === 'test-games') {
      // 7a. Create TestGame entry
      const testGame = await prisma.testGame.create({
        data: {
          gameId: filename,
          title: metadata.title,
          description: metadata.description,
          category: content.category,
          type:
            content.gameType.includes('3D') ||
            content.gameType.includes('SIMULATION')
              ? 'game'
              : 'lesson',
          gradeLevel: content.gradeLevel,
          difficulty: content.difficulty,
          skills: content.skills,
          estimatedTime: metadata.estimatedTime || '10-15 mins',
          filePath,
          isHtmlGame: true,
          status: 'NOT_TESTED',
          createdBy: session.user.id,
        },
      });

      // Update GeminiContent
      await prisma.geminiContent.update({
        where: { id: contentId },
        data: {
          status: 'TESTING',
          filePath,
          testGameId: testGame.id,
          publishedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        destination: 'test-games',
        testGameId: testGame.id,
        filePath,
        previewUrl: `/games/${filename}.html`,
        message: 'Game published to Test Games successfully',
      });
    } else {
      // 7b. Mark as ready for catalog (manual catalogData.ts update needed)
      await prisma.geminiContent.update({
        where: { id: contentId },
        data: {
          status: 'APPROVED',
          filePath,
          publishedAt: new Date(),
        },
      });

      // Generate catalog entry template
      const catalogEntry = {
        id: filename,
        title: metadata.title,
        description: metadata.description,
        type:
          content.gameType.includes('3D') ||
          content.gameType.includes('SIMULATION')
            ? 'game'
            : 'lesson',
        category: content.category,
        gradeLevel: content.gradeLevel,
        difficulty: content.difficulty,
        skills: content.skills,
        estimatedTime: metadata.estimatedTime || '10-15 mins',
        htmlPath: filePath,
        featured: metadata.featured || false,
      };

      return NextResponse.json({
        success: true,
        destination: 'catalog',
        filePath,
        previewUrl: `/games/${filename}.html`,
        message:
          'Content ready for catalog. Add the following to lib/catalogData.ts:',
        catalogEntry,
        instructions: `
Add this to the appropriate array in lib/catalogData.ts:
- For ${content.category} games: ${content.category}Games array
- For ${content.category} lessons: ${content.category}Lessons array
        `.trim(),
      });
    }
  } catch (error: any) {
    console.error('Publish error:', error);
    return NextResponse.json(
      { error: 'Publishing failed', details: error.message },
      { status: 500 }
    );
  }
}

// Helper: Generate unique filename
function generateUniqueFilename(title: string, category: string): string {
  // Create slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  // Add short hash for uniqueness
  const hash = crypto.randomBytes(4).toString('hex');

  return `gemini-${category}-${slug}-${hash}`;
}
