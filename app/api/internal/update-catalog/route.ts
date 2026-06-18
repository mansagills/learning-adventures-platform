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

    // ── Input validation ──────────────────────────────────────────────────
    // Everything here is interpolated into a source file, so validate the
    // values that drive control flow (array name) and reject anything that
    // isn't the shape we expect before serializing.
    const ALLOWED_CATEGORIES = [
      'math',
      'science',
      'english',
      'history',
      'interdisciplinary',
    ];
    const IDENTIFIER_RE = /^[a-z0-9-]+$/i;
    const isStr = (v: unknown): v is string =>
      typeof v === 'string' && v.length > 0;
    const isStrArray = (v: unknown): v is string[] =>
      Array.isArray(v) && v.every((s) => typeof s === 'string');

    if (metadata.type !== 'game' && metadata.type !== 'lesson') {
      return NextResponse.json(
        { error: "Invalid type. Must be 'game' or 'lesson'." },
        { status: 400 }
      );
    }
    if (!ALLOWED_CATEGORIES.includes(metadata.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }
    if (!isStr(metadata.id) || !IDENTIFIER_RE.test(metadata.id)) {
      return NextResponse.json(
        { error: 'Invalid id. Must be alphanumeric with hyphens only.' },
        { status: 400 }
      );
    }
    if (
      !isStr(metadata.title) ||
      !isStr(metadata.description) ||
      !isStr(metadata.difficulty) ||
      !isStr(metadata.estimatedTime) ||
      !isStrArray(metadata.gradeLevel) ||
      !isStrArray(metadata.skills)
    ) {
      return NextResponse.json(
        { error: 'Invalid or missing required adventure fields.' },
        { status: 400 }
      );
    }

    // Read the current catalog data
    const catalogPath = join(process.cwd(), 'lib', 'catalogData.ts');
    const catalogContent = await readFile(catalogPath, 'utf8');

    // Find the appropriate array to update (category/type validated above)
    const arrayName = `${metadata.category}${metadata.type === 'game' ? 'Games' : 'Lessons'}`;

    // Build the new adventure as a plain object, including only the optional
    // fields that apply. Values are NOT trusted — they are serialized with
    // JSON.stringify below, which escapes quotes/newlines/backslashes and
    // makes string-breakout / code injection (SSTI/RCE) impossible.
    const newAdventure: Record<string, unknown> = {
      id: metadata.id,
      title: metadata.title,
      description: metadata.description,
      type: metadata.type,
      category: metadata.category,
      gradeLevel: metadata.gradeLevel,
      difficulty: metadata.difficulty,
      skills: metadata.skills,
      estimatedTime: metadata.estimatedTime,
      featured: Boolean(metadata.featured),
    };
    if (isStr(metadata.htmlPath)) newAdventure.htmlPath = metadata.htmlPath;
    if (isStr(metadata.subscriptionTier) && metadata.subscriptionTier !== 'free') {
      newAdventure.subscriptionTier = metadata.subscriptionTier;
    }
    if (metadata.uploadedContent) newAdventure.uploadedContent = true;
    if (isStr(metadata.platform)) newAdventure.platform = metadata.platform;
    if (isStr(metadata.sourceCodeUrl)) newAdventure.sourceCodeUrl = metadata.sourceCodeUrl;

    // Serialize safely, then indent two spaces to sit inside the array.
    // JSON is valid TypeScript object-literal syntax.
    const adventureString = JSON.stringify(newAdventure, null, 2)
      .split('\n')
      .map((line) => `  ${line}`)
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
