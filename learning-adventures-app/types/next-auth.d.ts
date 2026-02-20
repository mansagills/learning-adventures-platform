import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      gradeLevel?: string | null;
      subjects?: string[];
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: string;
    gradeLevel?: string | null;
    subjects?: string[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    gradeLevel?: string | null;
    subjects?: string[];
  }
}
