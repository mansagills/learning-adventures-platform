'use client';

interface DatePickerProps {
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  label: string;
  error?: string;
  required?: boolean;
  minDate?: string; // ISO date string
  maxDate?: string; // ISO date string
  helpText?: string;
  className?: string;
}

export default function DatePicker({
  value = '',
  onChange,
  label,
  error,
  required = false,
  minDate,
  maxDate,
  helpText,
  className = '',
}: DatePickerProps) {
  // Format date for display (e.g., "January 15, 2025")
  const formatDateForDisplay = (isoDate: string): string => {
    if (!isoDate) return '';

    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-semibold text-ink-900">
        {label}
        {required && <span className="text-coral-500 ml-1">*</span>}
      </label>

      {/* Help Text */}
      {helpText && <p className="text-xs text-gray-600">{helpText}</p>}

      {/* Date Input Container */}
      <div className="relative">
        {/* Calendar Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Date Input */}
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          min={minDate}
          max={maxDate}
          className={`
            w-full pl-12 pr-4 py-3 rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            ${
              error
                ? 'border-coral-500 bg-coral-50'
                : 'border-gray-200 bg-white hover:border-brand-300'
            }
          `}
        />
      </div>

      {/* Selected Date Display (For better UX) */}
      {value && !error && (
        <p className="text-xs text-gray-600 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Selected: {formatDateForDisplay(value)}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-coral-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
