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

    // Create the new adventure object
    const newAdventure = {
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
      htmlPath: metadata.htmlPath,
      subscriptionTier: metadata.subscriptionTier || 'free',
      uploadedContent: metadata.uploadedContent || false,
      platform: metadata.platform,
      sourceCodeUrl: metadata.sourceCodeUrl,
    };

    // Clean up empty optional fields to keep the output clean
    if (!newAdventure.htmlPath) delete newAdventure.htmlPath;
    if (newAdventure.subscriptionTier === 'free') delete newAdventure.subscriptionTier;
    if (!newAdventure.uploadedContent) delete newAdventure.uploadedContent;
    if (!newAdventure.platform) delete newAdventure.platform;
    if (!newAdventure.sourceCodeUrl) delete newAdventure.sourceCodeUrl;

    // Format the new adventure securely using JSON.stringify
    const adventureString = JSON.stringify(newAdventure, null, 2)
      .split('\n')
      .map(line => `  ${line}`)
      .join('\n')
      .trimStart();

    const finalAdventureString = `  ${adventureString}`;

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
      ? arrayContent + ',\n' + finalAdventureString
      : '\n' + finalAdventureString + '\n';

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
