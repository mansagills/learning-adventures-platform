import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

// POST /api/admin/test-games/[id]/promote - Promote game to catalog
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get game details
    const game = await prisma.testGame.findUnique({
      where: { id: params.id },
    });

    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    // Check if game is approved
    if (game.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Game must be approved before promoting to catalog' },
        { status: 400 }
      );
    }

    // Check if already catalogued
    if (game.catalogued) {
      return NextResponse.json(
        { error: 'Game is already in the catalog' },
        { status: 400 }
      );
    }

    // Create catalog entry object
    const catalogEntry = {
      id: game.gameId,
      title: game.title,
      description: game.description,
      type: game.type,
      category: game.category,
      gradeLevel: game.gradeLevel,
      difficulty: game.difficulty,
      skills: game.skills,
      estimatedTime: game.estimatedTime,
      featured: false,
      ...(game.isHtmlGame && { htmlPath: game.filePath }),
      ...(game.isReactComponent && { componentGame: true }),
    };

    // Read catalogData.ts file
    const catalogDataPath = path.join(process.cwd(), 'lib', 'catalogData.ts');
    let catalogContent = await fs.readFile(catalogDataPath, 'utf-8');

    // Determine which array to add to based on category and type
    const arrayName = `${game.category}${game.type === 'game' ? 'Games' : 'Lessons'}`;

    // Format the entry as TypeScript code
    const entryCode = `  ${JSON.stringify(catalogEntry, null, 2)
      .split('\n')
      .join('\n  ')},`;

    // Find the appropriate array and add the entry
    // Look for pattern like: const mathGames: Adventure[] = [
    const arrayPattern = new RegExp(
      `(const ${arrayName}: Adventure\\[\\] = \\[)([\\s\\S]*?)(\\];)`,
      'm'
    );

    const match = catalogContent.match(arrayPattern);

    if (!match) {
      return NextResponse.json(
        { error: `Could not find ${arrayName} array in catalogData.ts` },
        { status: 500 }
      );
    }

    // Insert the new entry at the beginning of the array
    const updatedArray = match[1] + '\n' + entryCode + match[2] + match[3];
    catalogContent = catalogContent.replace(arrayPattern, updatedArray);

    // Write back to file
    await fs.writeFile(catalogDataPath, catalogContent, 'utf-8');

    // Update database to mark as catalogued
    await prisma.testGame.update({
      where: { id: params.id },
      data: {
        catalogued: true,
        cataloguedAt: new Date(),
        cataloguedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Game added to ${arrayName} array in catalogData.ts`,
      catalogEntry,
    });
  } catch (error) {
    console.error('Error promoting game to catalog:', error);
    return NextResponse.json(
      {
        error: 'Failed to promote game to catalog',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
