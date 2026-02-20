'use client';

interface RadioOption {
  label: string;
  value: string;
  description?: string;
  icon?: string; // Emoji or icon character
}

interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

export default function RadioGroup({
  value,
  onChange,
  options,
  label,
  error,
  required = false,
  className = '',
  layout = 'vertical',
}: RadioGroupProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Label */}
      <label className="block text-sm font-semibold text-ink-900">
        {label}
        {required && <span className="text-coral-500 ml-1">*</span>}
      </label>

      {/* Radio Options */}
      <div
        className={`
          ${
            layout === 'horizontal'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'space-y-2'
          }
        `}
      >
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <label
              key={option.value}
              className={`
                flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200'
                    : 'border-gray-200 bg-white hover:border-brand-300'
                }
                ${error ? 'border-coral-500' : ''}
              `}
            >
              {/* Radio Input */}
              <input
                type="radio"
                checked={isSelected}
                onChange={() => onChange(option.value)}
                className="
                  mt-0.5 w-5 h-5 border-gray-300 text-brand-500
                  focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                  cursor-pointer
                "
              />

              {/* Icon (Optional) */}
              {option.icon && (
                <div className="text-2xl flex-shrink-0">{option.icon}</div>
              )}

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
