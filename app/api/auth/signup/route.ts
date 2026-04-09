import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

const ALLOWED_ROLES = ['STUDENT', 'PARENT', 'TEACHER'] as const;
const ADMIN_DOMAIN = '@learningadventures.org';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, gradeLevel } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (email.endsWith(ADMIN_DOMAIN)) {
      return NextResponse.json(
        { error: 'Signups with @learningadventures.org are restricted.' },
        { status: 403 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const safeRole = ALLOWED_ROLES.includes(role) ? role : 'STUDENT';

    // Create Supabase Auth user
    const supabase = createServiceClient();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm for now; add email verification later
      user_metadata: { name },
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
      console.error('Supabase signup error:', authError);
      return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
    }

    const supabaseUser = authData.user;

    // Create Prisma User profile linked to Supabase UID
    const user = await prisma.user.create({
      data: {
        supabaseId: supabaseUser.id,
        name,
        email,
        role: safeRole,
        gradeLevel: safeRole === 'STUDENT' ? (gradeLevel ?? null) : null,
      },
      select: { id: true, name: true, email: true, role: true, gradeLevel: true, createdAt: true },
    });

    return NextResponse.json({ message: 'Account created successfully', user }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
