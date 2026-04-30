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

    // Security Fix: Prevent Server-Side Template Injection (SSTI)
    // Serialize object to string safely instead of using string concatenation
    const cleanObject = Object.fromEntries(
      Object.entries(newAdventure).filter(([k, v]) => {
        if (v === undefined || v === null || v === '') return false;
        if (k === 'subscriptionTier' && v === 'free') return false;
        if (k === 'uploadedContent' && v === false) return false;
        // explicitly include 'featured' even if false, to match prior behavior
        return true;
      })
    );

    // Format the JSON string to match the indentation of the array
    const adventureString = JSON.stringify(cleanObject, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? `  ${line}` : `  ${line}`))
      .join('\n');

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
