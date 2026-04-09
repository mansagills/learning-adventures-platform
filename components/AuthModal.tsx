'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Modal from './Modal';
import Button from './Button';
import Icon from './Icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT', gradeLevel: '',
  });

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setError('Failed to sign in with Google'); setIsLoading(false); }
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

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email, password: formData.password,
          role: formData.role, gradeLevel: formData.gradeLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create account');
        setIsLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email, password: formData.password,
      });

      if (signInError) {
        setError('Account created — please sign in.');
        setIsLoading(false);
        return;
      }

      onClose();
      router.push(formData.role === 'STUDENT' ? '/world/create' : '/');
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email, password: formData.password,
      });

      if (signInError) {
        setError('Invalid email or password');
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/profile');
        const profile = await res.json();
        onClose();
        router.push(profile.role === 'STUDENT' ? '/world' : '/');
      } catch {
        onClose();
        router.push('/');
      }
    }

    setIsLoading(false);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', confirmPassword: '', role: 'STUDENT', gradeLevel: '' });
    setError(null);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'signin' ? 'Sign In' : 'Create Account'} size="md">
      <div className="space-y-6">
        <Button onClick={handleGoogleSignIn} disabled={isLoading} variant="secondary" size="lg"
          className="w-full flex items-center justify-center space-x-2">
          <Icon name="globe" size={20} />
          <span>Continue with Google</span>
        </Button>

        <div className="flex items-center">
          <div className="flex-1 border-t border-gray-300" />
          <span className="px-3 text-sm text-ink-600">or</span>
          <div className="flex-1 border-t border-gray-300" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="modal-name" className="block text-sm font-medium text-ink-700 mb-1">Full Name</label>
                <input type="text" id="modal-name" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Enter your full name" />
              </div>

              <div>
                <label htmlFor="modal-role" className="block text-sm font-medium text-ink-700 mb-1">I am a...</label>
                <select id="modal-role" value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="STUDENT">Student</option>
                  <option value="PARENT">Parent</option>
                  <option value="TEACHER">Teacher</option>
                </select>
              </div>

              {formData.role === 'STUDENT' && (
                <div>
                  <label htmlFor="modal-grade" className="block text-sm font-medium text-ink-700 mb-1">Grade Level</label>
                  <select id="modal-grade" value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value="">Select Grade Level</option>
                    {['K','1','2','3','4','5','6','7','8','9','10','11','12'].map((g) => (
                      <option key={g} value={g}>{g === 'K' ? 'Kindergarten' : `${g}th Grade`}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="modal-confirm" className="block text-sm font-medium text-ink-700 mb-1">Confirm Password</label>
                <input type="password" id="modal-confirm" required minLength={8} value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  placeholder="Confirm your password" />
              </div>
            </>
          )}

          <div>
            <label htmlFor="modal-email" className="block text-sm font-medium text-ink-700 mb-1">Email</label>
            <input type="email" id="modal-email" required value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter your email" />
          </div>

          <div>
            <label htmlFor="modal-password" className="block text-sm font-medium text-ink-700 mb-1">Password</label>
            <input type="password" id="modal-password" required minLength={8} value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Enter your password" />
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
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); resetForm(); }}
            className="text-sm text-brand-600 hover:text-brand-700 transition-colors">
            {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
