import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const { metadata } = await request.json();

    if (!metadata) {
      return NextResponse.json(
        { error: 'Missing metadata' },
        { status: 400 }
      );
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
      sourceCodeUrl: metadata.sourceCodeUrl
    };

    // Format the new adventure as a string with optional premium fields
    let adventureString = `  {
    id: '${newAdventure.id}',
    title: '${newAdventure.title}',
    description: '${newAdventure.description}',
    type: '${newAdventure.type}',
    category: '${newAdventure.category}',
    gradeLevel: [${newAdventure.gradeLevel.map((g: string) => `'${g}'`).join(', ')}],
    difficulty: '${newAdventure.difficulty}',
    skills: [${newAdventure.skills.map((s: string) => `'${s}'`).join(', ')}],
    estimatedTime: '${newAdventure.estimatedTime}',
    featured: ${newAdventure.featured}${newAdventure.htmlPath ? `,\n    htmlPath: '${newAdventure.htmlPath}'` : ''}`;

    // Add premium/uploaded content fields if applicable
    if (newAdventure.subscriptionTier && newAdventure.subscriptionTier !== 'free') {
      adventureString += `,\n    subscriptionTier: '${newAdventure.subscriptionTier}'`;
    }

    if (newAdventure.uploadedContent) {
      adventureString += `,\n    uploadedContent: ${newAdventure.uploadedContent}`;
    }

    if (newAdventure.platform) {
      adventureString += `,\n    platform: '${newAdventure.platform}'`;
    }

    if (newAdventure.sourceCodeUrl) {
      adventureString += `,\n    sourceCodeUrl: '${newAdventure.sourceCodeUrl}'`;
    }

    adventureString += `\n  }`;

    // Find the array and add the new adventure
    const arrayRegex = new RegExp(`(const ${arrayName}: Adventure\\[\\] = \\[)([\\s\\S]*?)(\\];)`, 'm');
    const match = catalogContent.match(arrayRegex);

    if (!match) {
      return NextResponse.json(
        { error: `Could not find ${arrayName} array in catalog` },
        { status: 500 }
      );
    }

    const [fullMatch, arrayStart, arrayContent, arrayEnd] = match;

    // Add the new adventure to the array
    const updatedArrayContent = arrayContent.trim() ?
      arrayContent + ',\n' + adventureString :
      '\n' + adventureString + '\n';

    const updatedCatalog = catalogContent.replace(
      fullMatch,
      arrayStart + updatedArrayContent + arrayEnd
    );

    // Write the updated catalog back to file
    await writeFile(catalogPath, updatedCatalog, 'utf8');

    return NextResponse.json({
      success: true,
      message: `Added ${metadata.title} to ${arrayName} array`
    });

  } catch (error) {
    console.error('Error updating catalog:', error);
    return NextResponse.json(
      { error: 'Failed to update catalog' },
      { status: 500 }
    );
  }
}