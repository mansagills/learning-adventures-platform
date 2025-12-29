'use client';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSaveDraft?: () => void;
  onSubmit?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSaving?: boolean;
  isSubmitting?: boolean;
  canProceed?: boolean;
}

export default function FormNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSaveDraft,
  onSubmit,
  isFirstStep,
  isLastStep,
  isSaving = false,
  isSubmitting = false,
  canProceed = true,
}: FormNavigationProps) {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left Side - Previous Button */}
        <div className="w-full sm:w-auto">
          {!isFirstStep && (
            <button
              onClick={onPrevious}
              disabled={isSaving || isSubmitting}
              className="
                w-full sm:w-auto px-6 py-3 rounded-lg
                border-2 border-gray-300 text-gray-700 font-semibold
                hover:border-gray-400 hover:bg-gray-50
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all flex items-center justify-center gap-2
              "
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>
          )}
        </div>

        {/* Center - Save Draft Button */}
        {onSaveDraft && !isLastStep && (
          <div className="w-full sm:w-auto order-first sm:order-none">
            <button
              onClick={onSaveDraft}
              disabled={isSaving || isSubmitting}
              className="
                w-full sm:w-auto px-6 py-3 rounded-lg
                border-2 border-accent-300 text-accent-700 font-semibold
                hover:border-accent-400 hover:bg-accent-50
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all flex items-center justify-center gap-2
              "
            >
              {isSaving ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save Draft
                </>
              )}
            </button>
          </div>
        )}

        {/* Right Side - Next or Submit Button */}
        <div className="w-full sm:w-auto">
          {isLastStep ? (
            <button
              onClick={onSubmit}
              disabled={!canProceed || isSubmitting || isSaving}
              className="
                w-full sm:w-auto px-8 py-3 rounded-lg
                bg-gradient-to-r from-brand-500 to-ocean-500
                text-white font-bold text-lg
                hover:from-brand-600 hover:to-ocean-600
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-lg hover:shadow-xl
                transition-all flex items-center justify-center gap-2
              "
            >
              {isSubmitting ? (
                <>
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={onNext}
              disabled={!canProceed || isSaving || isSubmitting}
              className="
                w-full sm:w-auto px-6 py-3 rounded-lg
                bg-brand-500 text-white font-semibold
                hover:bg-brand-600
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all flex items-center justify-center gap-2
              "
            >
              Continue
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Validation Message */}
      {!canProceed && (
        <div className="mt-4 p-3 bg-coral-50 border border-coral-200 rounded-lg">
          <p className="text-sm text-coral-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Please fill out all required fields before continuing
          </p>
        </div>
      )}
    </div>
  );
}
