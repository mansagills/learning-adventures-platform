'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
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
  const resolvedCallbackUrl = callbackUrl || '/dashboard';

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

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn('google', { callbackUrl: resolvedCallbackUrl });
    } catch {
      setError('Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signIn('apple', { callbackUrl: resolvedCallbackUrl });
    } catch {
      setError('Failed to sign in with Apple');
      setIsLoading(false);
    }
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

      try {
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

        if (response.ok) {
          await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            callbackUrl: resolvedCallbackUrl,
          });
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to create account');
        }
      } catch {
        setError('Failed to create account');
      }
    } else {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        window.location.href = resolvedCallbackUrl;
      }
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'STUDENT',
      gradeLevel: '',
    });
    setError(null);
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Branding */}
      <div className="mb-8 text-center">
        <Link
          href={'/'}
          className="inline-flex items-center space-x-2 font-display font-bold text-2xl text-brand-500"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
            <Icon name="academic" size={22} className="text-white" />
          </div>
          <span>Learning Adventures</span>
        </Link>
        <p className="mt-2 text-ink-500 text-sm">
          {mode === 'signin' ? 'Welcome back! Sign in to continue.' : 'Create your account to get started.'}
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h1 className="text-2xl font-display font-bold text-ink-900 mb-6">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h1>

        <div className="space-y-6">
          {/* OAuth Providers */}
          <div className="space-y-3">
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

            <Button
              onClick={handleAppleSignIn}
              disabled={isLoading}
              variant="secondary"
              size="lg"
              className="w-full flex items-center justify-center space-x-2 bg-black text-white hover:bg-gray-800"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>Continue with Apple</span>
            </Button>
          </div>

          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-sm text-ink-400">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-ink-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-ink-700 mb-1">
                    I am a...
                  </label>
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
                    <label htmlFor="gradeLevel" className="block text-sm font-medium text-ink-700 mb-1">
                      Grade Level
                    </label>
                    <select
                      id="gradeLevel"
                      value={formData.gradeLevel}
                      onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select Grade Level</option>
                      <option value="K">Kindergarten</option>
                      <option value="1">1st Grade</option>
                      <option value="2">2nd Grade</option>
                      <option value="3">3rd Grade</option>
                      <option value="4">4th Grade</option>
                      <option value="5">5th Grade</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="Enter your password"
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Confirm your password"
                />
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              size="lg"
              className="w-full"
            >
              {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Switch Mode */}
          <div className="text-center">
            <button
              onClick={switchMode}
              className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
            >
              {mode === 'signin'
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>

      {/* Back to marketing */}
      <div className="mt-6">
        <Link
          href={'/'}
          className="text-sm text-ink-400 hover:text-ink-600 transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
