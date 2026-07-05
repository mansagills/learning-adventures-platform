export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getApiUser } from '@/lib/api-auth';

export async function GET() {
  const { apiUser, error } = await getApiUser();
  if (error) return error;

  return NextResponse.json({
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role,
    gradeLevel: apiUser.gradeLevel,
    subjects: apiUser.subjects,
    image: apiUser.image,
  });
}
