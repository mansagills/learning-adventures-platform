export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { getApiUser } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
  const { apiUser, error } = await getApiUser();
  if (error || !apiUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (apiUser.role !== 'ADMIN' && apiUser.role !== 'TEACHER') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { metadata } = await request.json();

    if (!metadata) {
      return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
    }

    // Read the current catalog data
    const catalogPath = join(process.cwd(), 'lib', 'catalogData.ts');
    const catalogContent = await readFile(catalogPath, 'utf8');

    // Find the appropriate array to update
    const arrayName = `${metadata.category}${metadata.type === 'game' ? 'Games' : 'Lessons'}`;

    // Create the new adventure object securely
    const newAdventure: Record<string, any> = {
      id: metadata.id,
      title: metadata.title,
      description: metadata.description,
      type: metadata.type,
      category: metadata.category,
      gradeLevel: metadata.gradeLevel,
      difficulty: metadata.difficulty,
      skills: metadata.skills,
      estimatedTime: metadata.estimatedTime,
      featured: metadata.featured || false,
    };

    // Add optional fields securely
    if (metadata.htmlPath) newAdventure.htmlPath = metadata.htmlPath;
    if (metadata.subscriptionTier && metadata.subscriptionTier !== 'free') {
      newAdventure.subscriptionTier = metadata.subscriptionTier;
    }
    if (metadata.uploadedContent) newAdventure.uploadedContent = metadata.uploadedContent;
    if (metadata.platform) newAdventure.platform = metadata.platform;
    if (metadata.sourceCodeUrl) newAdventure.sourceCodeUrl = metadata.sourceCodeUrl;

    // Format the new adventure safely using JSON.stringify to prevent RCE / SSTI
    const adventureString = `  ${JSON.stringify(newAdventure, null, 2)
      .split('\n')
      .join('\n  ')}`;

    // Find the array and add the new adventure
    const arrayRegex = new RegExp(
      `(const ${arrayName}: Adventure\\[\\] = \\[)([\\s\\S]*?)(\\];)`,
      'm'
    );
    const match = catalogContent.match(arrayRegex);

    if (!match) {
      return NextResponse.json(
        { error: `Could not find ${arrayName} array in catalog` },
        { status: 500 }
      );
    }

    const [fullMatch, arrayStart, arrayContent, arrayEnd] = match;

    // Add the new adventure to the array
    const updatedArrayContent = arrayContent.trim()
      ? arrayContent + ',\n' + adventureString
      : '\n' + adventureString + '\n';

    const updatedCatalog = catalogContent.replace(
      fullMatch,
      arrayStart + updatedArrayContent + arrayEnd
    );

    // Write the updated catalog back to file
    await writeFile(catalogPath, updatedCatalog, 'utf8');

    return NextResponse.json({
      success: true,
      message: `Added ${metadata.title} to ${arrayName} array`,
    });
  } catch (error) {
    console.error('Error updating catalog:', error);
    return NextResponse.json(
      { error: 'Failed to update catalog' },
      { status: 500 }
    );
  }
}
