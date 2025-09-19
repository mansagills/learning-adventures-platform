import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const { content, fileName, type } = await request.json();

    if (!content || !fileName || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: content, fileName, type' },
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

    // Create directory path
    const publicDir = join(process.cwd(), 'public');
    const typeDir = join(publicDir, `${type}s`);
    const filePath = join(typeDir, fileName);

    // Ensure directory exists
    if (!existsSync(typeDir)) {
      await mkdir(typeDir, { recursive: true });
    }

    // Write the HTML content to file
    await writeFile(filePath, content, 'utf8');

    return NextResponse.json({
      success: true,
      filePath: `/${type}s/${fileName}`
    });

  } catch (error) {
    console.error('Error saving content:', error);
    return NextResponse.json(
      { error: 'Failed to save content file' },
      { status: 500 }
    );
  }
}