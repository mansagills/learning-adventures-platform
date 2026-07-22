import React from 'react';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error';
  showCloseButton?: boolean;
}

const typeStyles = {
  info: 'border-blue-200 bg-blue-50',
  success: 'border-green-200 bg-green-50',
  warning: 'border-yellow-200 bg-yellow-50',
  error: 'border-red-200 bg-red-50',
};

const titleStyles = {
  info: 'text-blue-800',
  success: 'text-green-800',
  warning: 'text-yellow-800',
  error: 'text-red-800',
};

export function GameModal({
  isOpen,
  onClose,
  title,
  children,
  type = 'info',
  showCloseButton = true,
}: GameModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
        relative bg-white rounded-2xl shadow-2xl border-2 max-w-md w-full transform transition-all
        ${typeStyles[type]}
      `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${titleStyles[type]}`}>
              {title}
            </h3>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
