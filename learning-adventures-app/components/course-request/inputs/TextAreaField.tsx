'use client';

import { useState, useEffect } from 'react';

interface TextAreaFieldProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
  maxLength?: number;
  showCharacterCount?: boolean;
  helpText?: string;
  className?: string;
}

export default function TextAreaField({
  value = '',
  onChange,
  label,
  placeholder = '',
  error,
  required = false,
  rows = 4,
  maxLength,
  showCharacterCount = true,
  helpText,
  className = '',
}: TextAreaFieldProps) {
  const [charCount, setCharCount] = useState(value?.length || 0);

  useEffect(() => {
    setCharCount(value?.length || 0);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Enforce maxLength if provided
    if (maxLength && newValue.length > maxLength) {
      return;
    }

    onChange(newValue);
    setCharCount(newValue.length);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-ink-900">
          {label}
          {required && <span className="text-coral-500 ml-1">*</span>}
        </label>

        {/* Character Count */}
        {showCharacterCount && maxLength && (
          <span
            className={`text-xs ${
              charCount > maxLength * 0.9
                ? 'text-coral-600 font-semibold'
                : 'text-gray-500'
            }`}
          >
            {charCount} / {maxLength}
          </span>
        )}
      </div>

      {/* Help Text */}
      {helpText && <p className="text-xs text-gray-600">{helpText}</p>}

      {/* Textarea */}
      <textarea
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`
          w-full px-4 py-3 rounded-lg border-2 transition-all
          focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          resize-y min-h-[100px]
          ${
            error
              ? 'border-coral-500 bg-coral-50'
              : 'border-gray-200 bg-white hover:border-brand-300'
          }
        `}
      />

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
