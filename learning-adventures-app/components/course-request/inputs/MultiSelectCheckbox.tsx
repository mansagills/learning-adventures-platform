'use client';

import { useState } from 'react';

interface CheckboxOption {
  label: string;
  value: string;
  description?: string;
}

interface MultiSelectCheckboxProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: CheckboxOption[];
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export default function MultiSelectCheckbox({
  value = [],
  onChange,
  options,
  label,
  error,
  required = false,
  className = '',
}: MultiSelectCheckboxProps) {
  const handleToggle = (optionValue: string) => {
    const currentValues = Array.isArray(value) ? value : [];

    if (currentValues.includes(optionValue)) {
      // Remove if already selected
      onChange(currentValues.filter(v => v !== optionValue));
    } else {
      // Add if not selected
      onChange([...currentValues, optionValue]);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-semibold text-ink-900">
        {label}
        {required && <span className="text-coral-500 ml-1">*</span>}
      </label>

      {/* Checkbox Options */}
      <div className="space-y-2">
        {options.map((option) => {
          const isChecked = Array.isArray(value) && value.includes(option.value);

          return (
            <label
              key={option.value}
              className={`
                flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${isChecked
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-gray-200 bg-white hover:border-brand-300'
                }
                ${error ? 'border-coral-500' : ''}
              `}
            >
              {/* Checkbox Input */}
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(option.value)}
                className="
                  mt-0.5 w-5 h-5 rounded border-gray-300 text-brand-500
                  focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                  cursor-pointer
                "
              />

              {/* Label & Description */}
              <div className="flex-1">
                <div className="text-sm font-medium text-ink-900">
                  {option.label}
                </div>
                {option.description && (
                  <div className="text-xs text-gray-600 mt-1">
                    {option.description}
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-coral-600 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {/* Selection Count Helper */}
      {value && value.length > 0 && !error && (
        <p className="text-xs text-gray-500">
          {value.length} {value.length === 1 ? 'option' : 'options'} selected
        </p>
      )}
    </div>
  );
}
