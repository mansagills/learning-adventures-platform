'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Icon from '@/components/Icon';

export default function UnauthorizedPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="close" size={32} className="text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-ink-800 mb-4">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-ink-600 mb-6">
            {session?.user
              ? "You don't have permission to access this page. Your current role doesn't allow you to view this content."
              : 'You need to be logged in to access this page.'}
          </p>

          {/* User Info */}
          {session?.user && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-ink-500 mb-1">Logged in as:</p>
              <p className="font-medium text-ink-800">{session.user.email}</p>
              <p className="text-sm text-brand-600 font-medium mt-1">
                Role: {session.user.role?.charAt(0) + session.user.role?.slice(1).toLowerCase()}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
            >
              Go to Homepage
            </Link>

            {session?.user ? (
              <Link
                href="/dashboard"
                className="block w-full px-6 py-3 bg-gray-100 text-ink-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/?auth=login"
                className="block w-full px-6 py-3 bg-gray-100 text-ink-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Login
              </Link>
            )}
          </div>

          {/* Help Text */}
          <p className="text-sm text-ink-500 mt-6">
            If you believe this is an error, please contact support.
          </p>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Need different access?
              </h3>
              <p className="text-sm text-blue-800">
                Contact your administrator to request access to this feature or to change your role permissions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
