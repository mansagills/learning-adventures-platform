import { NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const { apiUser, error } = await getApiUser();
  if (error || !apiUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: apiUser.id },
    data: { hasCompletedOnboarding: true },
  });

  return NextResponse.json({ success: true });
}
