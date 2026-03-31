import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST - Create new draft
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has PARENT or TEACHER role
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (
      !user ||
      (user.role !== 'PARENT' &&
        user.role !== 'TEACHER' &&
        user.role !== 'ADMIN')
    ) {
      return NextResponse.json(
        { error: 'Only parents and teachers can create course requests' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Check if user already has a draft
    const existingDraft = await prisma.courseRequest.findFirst({
      where: {
        userId: session.user.id,
        isDraft: true,
        status: 'DRAFT',
      },
    });

    if (existingDraft) {
      // Update existing draft instead
      const updated = await prisma.courseRequest.update({
        where: { id: existingDraft.id },
        data: {
          ...body,
          isDraft: true,
          status: 'DRAFT',
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        id: updated.id,
        updatedAt: updated.updatedAt,
      });
    }

    // Create new draft
    const draft = await prisma.courseRequest.create({
      data: {
        userId: session.user.id,
        ...body,
        isDraft: true,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({
      id: draft.id,
      updatedAt: draft.updatedAt,
    });
  } catch (error) {
    console.error('Draft save error:', error);
    return NextResponse.json(
      {
        error: 'Failed to save draft',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update existing draft
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Draft ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.courseRequest.findUnique({
      where: { id },
      select: { userId: true, updatedAt: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this draft' },
        { status: 403 }
      );
    }

    // Conflict detection: check if server version is newer
    if (
      updateData.clientLastSaved &&
      existing.updatedAt > new Date(updateData.clientLastSaved)
    ) {
      return NextResponse.json(
        {
          conflict: true,
          serverVersion: existing,
          message: 'A newer version exists. Which would you like to keep?',
        },
        { status: 409 }
      );
    }

    // Update draft
    const updated = await prisma.courseRequest.update({
      where: { id },
      data: {
        ...updateData,
        isDraft: true,
        status: 'DRAFT',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      id: updated.id,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error('Draft update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update draft',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET - Retrieve user's draft
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const draft = await prisma.courseRequest.findFirst({
      where: {
        userId: session.user.id,
        isDraft: true,
        status: 'DRAFT',
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!draft) {
      return NextResponse.json(null);
    }

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Draft retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve draft' },
      { status: 500 }
    );
  }
}
