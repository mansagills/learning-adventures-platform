'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';
import { getAppUrl } from '@/lib/utils/urls';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
  callbackUrl?: string;
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin', callbackUrl = '/' }: AuthModalProps) {
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
      // Always redirect to dashboard on app subdomain
      await signIn('google', { callbackUrl: getAppUrl('/dashboard') });
    } catch (err) {
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Always redirect to dashboard on app subdomain
      await signIn('apple', { callbackUrl: getAppUrl('/dashboard') });
    } catch (err) {
      setError('Failed to sign in with Apple');
    } finally {
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

      // Handle sign up
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
          // Auto sign in after successful signup and redirect to dashboard
          await signIn('credentials', {
            email: formData.email,
            password: formData.password,
            callbackUrl: getAppUrl('/dashboard'),
          });
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to create account');
        }
      } catch (err) {
        setError('Failed to create account');
      }
    } else {
      // Handle sign in
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        onClose();
        // Always redirect to dashboard on app subdomain
        window.location.href = getAppUrl('/dashboard');
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
    const newMode = mode === 'signin' ? 'signup' : 'signin';
    setMode(newMode);
    resetForm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'signin' ? 'Sign In' : 'Create Account'}
      size="md"
    >
      <div className="space-y-6">
        {/* OAuth Providers */}
        <div className="space-y-3">
          {/* Google Sign In */}
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

          {/* Apple Sign In */}
          <Button
            onClick={handleAppleSignIn}
            disabled={isLoading}
            variant="secondary"
            size="lg"
            className="w-full flex items-center justify-center space-x-2 bg-black text-white hover:bg-gray-800"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span>Continue with Apple</span>
          </Button>
        </div>

        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300" />
          <span className="px-3 text-sm text-ink-600">or</span>
          <div className="flex-1 border-t border-gray-300" />
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
              : 'Already have an account? Sign in'
            }
          </button>
        </div>
      </div>
    </Modal>
  );
}