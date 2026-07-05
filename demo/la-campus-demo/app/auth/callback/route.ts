import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Ensure a Prisma User profile exists for OAuth users
      const existing = await prisma.user.findUnique({
        where: { supabaseId: data.user.id },
      });

      if (!existing) {
        await prisma.user.create({
          data: {
            supabaseId: data.user.id,
            email: data.user.email ?? '',
            name: data.user.user_metadata?.full_name ?? null,
            image: data.user.user_metadata?.avatar_url ?? null,
            role: 'STUDENT',
          },
        });
        // New OAuth student → character creation
        return NextResponse.redirect(`${origin}/world/create`);
      }

      // Returning user — redirect by role
      const destination = existing.role === 'STUDENT' ? '/world' : '/';
      return NextResponse.redirect(`${origin}${destination}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
