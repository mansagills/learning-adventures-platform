'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import Button from './Button';
import Icon from './Icon';

interface LoginPageContentProps {
  defaultMode?: 'signin' | 'signup';
  callbackUrl?: string;
}

export default function LoginPageContent({
  defaultMode = 'signin',
  callbackUrl,
}: LoginPageContentProps) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT',
    gradeLevel: '',
  });

  const getPostAuthUrl = (role: string) => {
    if (callbackUrl) return callbackUrl;
    return role === 'STUDENT' ? '/world' : '/';
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError('Failed to sign in with Google');
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (mode === 'signup') {
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Create account via our API (handles Supabase + Prisma profile creation)
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          gradeLevel: formData.gradeLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      // Sign in immediately after account creation
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError('Account created but sign-in failed. Please sign in manually.');
        setIsLoading(false);
        return;
      }

      // Students go to character creation on first signup
      const destination = formData.role === 'STUDENT' ? '/world/create' : '/';
      router.push(destination);
    } else {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      // Fetch role from our DB to determine redirect
      try {
        const res = await fetch('/api/auth/profile');
        const profile = await res.json();
        router.push(getPostAuthUrl(profile.role ?? 'STUDENT'));
      } catch {
        router.push('/');
      }
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT', gradeLevel: '' });
    setError(null);
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center space-x-2 font-display font-bold text-2xl text-brand-500">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Icon name="academic" size={22} className="text-white" />
          </div>
          <span>Learning Adventures</span>
        </Link>
        <p className="mt-2 text-ink-500 text-sm">
          {mode === 'signin' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-display font-bold text-ink-900 mb-6">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>

        <div className="space-y-6">
          <Button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            variant="secondary"
            size="lg"
            className="w-full flex items-center justify-center space-x-2"
          >
            <Icon name="globe" size={20} />
            <span>Continue with Google</span>
          </Button>

          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-sm text-ink-400">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1">Full Name</label>
                  <input
                    type="text" id="name" required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-ink-700 mb-1">I am a...</label>
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="PARENT">Parent</option>
                    <option value="TEACHER">Teacher</option>
                  </select>
                </div>

                {formData.role === 'STUDENT' && (
                  <div>
                    <label htmlFor="gradeLevel" className="block text-sm font-medium text-ink-700 mb-1">Grade Level</label>
                    <select
                      id="gradeLevel"
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select Grade Level</option>
                      {['K','1','2','3','4','5','6','7','8','9','10','11','12'].map((g) => (
                        <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `${g}th Grade`}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-1">Confirm Password</label>
                  <input
                    type="password" id="confirmPassword" required minLength={8}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Confirm your password"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">Email</label>
              <input
                type="email" id="email" required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1">Password</label>
              <input
                type="password" id="password" required minLength={8}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={isLoading} variant="primary" size="lg" className="w-full">
              {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="text-center">
            <button onClick={switchMode} className="text-sm text-brand-600 hover:text-brand-700 transition-colors">
              {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Link href="/" className="text-sm text-ink-400 hover:text-ink-600 transition-colors">← Back to home</Link>
      </div>
    </div>
  );
}
