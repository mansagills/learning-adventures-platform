'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Icon from '@/components/Icon';

export default function ChildLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [childName, setChildName] = useState('');

  const pinRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Check if already logged in as child
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/child/session');
      const data = await res.json();
      if (data.authenticated && data.child) {
        router.push('/child/dashboard');
      }
    } catch (err) {
      // Not logged in, stay on page
    }
  };

  const handlePinChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1);

    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError(null);

    // Auto-focus next input
    if (digit && index < 3) {
      pinRefs[index + 1].current?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === 3 && newPin.every((d) => d)) {
      handleLogin(newPin.join(''));
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs[index - 1].current?.focus();
    }
  };

  const handleLogin = async (pinCode?: string) => {
    const finalPin = pinCode || pin.join('');

    if (!username.trim()) {
      setError('Please enter your username');
      return;
    }

    if (finalPin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/child/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), pin: finalPin }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setChildName(data.child.displayName);
        setShowSuccess(true);
        setTimeout(() => {
          router.push('/child/dashboard');
        }, 1500);
      } else {
        setError(data.error || 'Login failed. Check your username and PIN.');
        setPin(['', '', '', '']);
        pinRefs[0].current?.focus();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setPin(['', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-500 via-brand-600 to-accent-500 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-4xl font-bold mb-4">Welcome, {childName}!</h1>
          <p className="text-xl text-white/80">Loading your adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-400 via-brand-500 to-accent-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <Icon name="academic" size={48} className="text-brand-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Learning Adventures
          </h1>
          <p className="text-white/80 text-lg">
            Enter your username and secret PIN
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit}>
            {/* Username Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2 text-lg">
                Your Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-4 text-xl border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all text-center font-mono"
                placeholder="BraveEagle42"
                autoComplete="off"
                autoFocus
              />
            </div>

            {/* PIN Input */}
            <div className="mb-6">
              <label className="block text-gray-700 font-bold mb-2 text-lg">
                Secret PIN
              </label>
              <div className="flex justify-center gap-3">
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={pinRefs[index]}
                    type="password"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(index, e.target.value)}
                    onKeyDown={(e) => handlePinKeyDown(index, e)}
                    className="w-16 h-20 text-3xl text-center border-2 border-gray-200 rounded-xl focus:border-brand-500 focus:ring-4 focus:ring-brand-100 transition-all font-bold"
                    autoComplete="off"
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-700 text-center font-medium">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading || !username || pin.some((d) => !d)}
              className="w-full py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white text-xl font-bold rounded-xl hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🌟</span>
                  <span>Logging in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Start Learning!</span>
                  <span>🚀</span>
                </span>
              )}
            </button>
          </form>

          {/* Help Links */}
          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-gray-500 text-sm mb-3">
              Need help? Ask a parent or teacher!
            </p>
            <Link
              href="/"
              className="text-brand-600 hover:text-brand-700 font-medium text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Parent Link */}
        <div className="text-center mt-6">
          <Link
            href="/auth/signin"
            className="text-white/80 hover:text-white text-sm underline"
          >
            Parent or Teacher? Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
