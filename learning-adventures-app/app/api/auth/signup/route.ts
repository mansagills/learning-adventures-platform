import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role, gradeLevel } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // SECURITY: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // SECURITY: Prevent privilege escalation by blocking signup with admin domain
    if (email.endsWith('@learningadventures.org')) {
      return NextResponse.json(
        { error: 'Signups with @learningadventures.org are restricted. Please contact an administrator.' },
        { status: 403 }
      );
    }

    // SECURITY: Enforce password policy (min 8 chars)
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Validate role (SECURITY: Prevent role escalation)
    const allowedRoles = ['STUDENT', 'PARENT', 'TEACHER'];
    const safeRole = allowedRoles.includes(role) ? role : 'STUDENT';

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: safeRole,
        gradeLevel: safeRole === 'STUDENT' ? gradeLevel : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gradeLevel: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}