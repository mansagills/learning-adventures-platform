'use client';

interface FormProgressBarProps {
  currentStep: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

const stepNames = [
  'Requestor Info',
  'Student Profile',
  'Subject & Focus',
  'Learning Challenges',
  'Learning Style',
  'Course Format',
  'Assessment',
  'Delivery',
  'Budget',
  'Review & Submit',
];

export default function FormProgressBar({
  currentStep,
  totalSteps = 10,
  onStepClick,
}: FormProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />

        {/* Progress Fill */}
        <div
          className="absolute top-5 left-0 h-1 bg-brand-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />

        {/* Step Circles */}
        <div className="relative flex justify-between">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isClickable = onStepClick && stepNumber <= currentStep;

            return (
              <button
                key={stepNumber}
                onClick={() => isClickable && onStepClick(stepNumber)}
                disabled={!isClickable}
                className={`
                  flex flex-col items-center gap-2 group
                  ${isClickable ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {/* Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    font-semibold text-sm transition-all duration-300
                    ${
                      isCompleted
                        ? 'bg-brand-500 text-white shadow-md'
                        : isCurrent
                          ? 'bg-white border-4 border-brand-500 text-brand-600 shadow-lg ring-4 ring-brand-100'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                    }
                    ${isClickable ? 'hover:scale-110' : ''}
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    stepNumber
                  )}
                </div>

                {/* Step Name (Desktop) */}
                <div className="hidden lg:block text-center max-w-[100px]">
                  <span
                    className={`
                      text-xs font-medium leading-tight
                      ${isCurrent ? 'text-brand-600' : 'text-gray-600'}
                    `}
                  >
                    {stepNames[index]}
                  </span>
                </div>

                {/* Step Name (Mobile - Only Current) */}
                {isCurrent && (
                  <div className="lg:hidden text-center">
                    <span className="text-xs font-semibold text-brand-600">
                      {stepNames[index]}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Step Indicator (Mobile) */}
      <div className="mt-6 lg:hidden text-center">
        <p className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Current Step Indicator (Desktop) */}
      <div className="hidden lg:block mt-4 text-center">
        <p className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}: {stepNames[currentStep - 1]}
        </p>
      </div>
    </div>
  );
}
