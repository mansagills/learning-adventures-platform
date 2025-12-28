import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processCoursePackage } from '@/lib/upload/coursePackageHandler';

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

    const result = await processCoursePackage(zipFile, session.user.id);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Course package error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process course package',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
