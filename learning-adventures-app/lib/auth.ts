import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AppleProvider from 'next-auth/providers/apple';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';

console.log('🔧 Auth configuration loaded');

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🚨 AUTHORIZE FUNCTION CALLED!');
        console.log('🔍 Authorization attempt:', {
          email: credentials?.email,
          hasPassword: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          console.log('👤 User lookup:', {
            found: !!user,
            hasPassword: !!user?.password,
          });

          if (!user || !user.password) {
            console.log('❌ User not found or no password');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔒 Password check:', { valid: isPasswordValid });

          if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return null;
          }

          console.log('✅ Authentication successful for:', user.email);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            gradeLevel: user.gradeLevel,
            subjects: user.subjects,
            image: user.image,
          };
        } catch (error) {
          console.error('💥 Auth error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // After login, redirect to app subdomain dashboard
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || baseUrl;

      // If the URL is a relative path, redirect to app subdomain
      if (url.startsWith('/')) {
        // Preserve the original path if it's a callback URL
        if (
          url.startsWith('/dashboard') ||
          url.startsWith('/games') ||
          url.startsWith('/profile')
        ) {
          return `${appUrl}${url}`;
        }
        return `${appUrl}/dashboard`;
      }

      // If URL is already an app subdomain URL, use it
      if (url.startsWith(appUrl)) {
        return url;
      }

      // Default: go to app dashboard
      return `${appUrl}/dashboard`;
    },
    async jwt({ token, user, account, trigger }) {
      // Initial sign in
      if (user) {
        token.role = (user as any).role;
        token.gradeLevel = (user as any).gradeLevel;
        token.subjects = (user as any).subjects;
      }

      // Fetch fresh user data from database on each token refresh
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.gradeLevel = dbUser.gradeLevel;
          token.subjects = dbUser.subjects;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.gradeLevel = token.gradeLevel as string;
        session.user.subjects = token.subjects as string[];
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Determine role for new users
      const defaultRole = 'STUDENT';

      // OAuth providers (Google, Apple) and Email provider
      if (
        account?.provider === 'google' ||
        account?.provider === 'apple' ||
        account?.provider === 'email'
      ) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (!existingUser) {
          // Create new user with default role
          await prisma.user.create({
            data: {
              email: user.email!,
              name: user.name,
              image: user.image,
              role: defaultRole,
            },
          });
          console.log(
            `✅ New user created with role ${defaultRole}:`,
            user.email
          );
        }
      }

      return true;
    },
  },
  // Using default NextAuth sign-in page at /api/auth/signin
  // pages: {
  //   signIn: '/auth/signin',
  // },
  secret: process.env.NEXTAUTH_SECRET,
};

// ============================================================================
// API Authentication Helpers
// ============================================================================

/**
 * Custom error classes
 */
export class AuthenticationError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'Not authorized') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Get the authenticated user from the request
 */
export async function getAuthenticatedUser(request?: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: session.user.role,
  };
}

/**
 * Require authentication - throws error if not authenticated
 */
export async function requireAuth(request?: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    throw new AuthenticationError('Authentication required');
  }

  return user;
}
