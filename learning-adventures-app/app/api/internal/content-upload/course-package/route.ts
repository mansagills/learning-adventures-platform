import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdmZip from 'adm-zip';
import {
  processCoursePackage,
  isCoursePackage,
  validateCoursePackage,
} from '@/lib/upload/coursePackageHandler';
import {
  processGamePackage,
  isGamePackage,
  validateGamePackage,
} from '@/lib/upload/gamePackageHandler';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const zipFile = formData.get('file') as File;

    if (!zipFile || !zipFile.name.endsWith('.zip')) {
      return NextResponse.json({ error: 'Invalid .zip file' }, { status: 400 });
    }

    // Read ZIP to determine package type
    const buffer = Buffer.from(await zipFile.arrayBuffer());
    const zip = new AdmZip(buffer);

    // Determine if this is a game or course package
    const isGame = isGamePackage(zip);
    const isCourse = isCoursePackage(zip);

    if (!isGame && !isCourse) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid package: metadata.json must have either "gameFile" (for games) or "lessons" array (for courses)',
        },
        { status: 400 }
      );
    }

    // Validate package structure
    const validation = isGame
      ? validateGamePackage(zip)
      : validateCoursePackage(zip);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package validation failed',
          validationErrors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Process the package - need to recreate File since we consumed the buffer
    const newFile = new File([buffer], zipFile.name, { type: zipFile.type });

    let result;
    if (isGame) {
      result = await processGamePackage(newFile, session.user.id);
      return NextResponse.json({
        ...result,
        type: 'game',
        message:
          'Game uploaded to staging successfully. Visit the Testing page to review and approve.',
      });
    } else {
      result = await processCoursePackage(newFile, session.user.id);
      return NextResponse.json({
        ...result,
        type: 'course',
        message:
          'Course uploaded to staging successfully. Visit the Testing page to review and approve.',
      });
    }
  } catch (error) {
    console.error('Package upload error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process package',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
