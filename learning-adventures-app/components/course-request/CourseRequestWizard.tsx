'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormProvider, useFormContext } from './FormContext';
import FormProgressBar from './FormProgressBar';
import FormNavigation from './FormNavigation';
import { useCourseRequestAutoSave } from '@/hooks/useCourseRequestAutoSave';

// Import step components
import Step1RequestorInfo from './steps/Step1RequestorInfo';
import Step2StudentProfile from './steps/Step2StudentProfile';
import Step3SubjectFocus from './steps/Step3SubjectFocus';
import Step4LearningChallenges from './steps/Step4LearningChallenges';
import Step5LearningStyle from './steps/Step5LearningStyle';
import Step6CourseFormat from './steps/Step6CourseFormat';
import Step7AssessmentCriteria from './steps/Step7AssessmentCriteria';
import Step8DeliveryLogistics from './steps/Step8DeliveryLogistics';
import Step9BudgetReusability from './steps/Step9BudgetReusability';
import Step10FinalNotes from './steps/Step10FinalNotes';

// Step component map
const stepComponents = {
  1: Step1RequestorInfo,
  2: Step2StudentProfile,
  3: Step3SubjectFocus,
  4: Step4LearningChallenges,
  5: Step5LearningStyle,
  6: Step6CourseFormat,
  7: Step7AssessmentCriteria,
  8: Step8DeliveryLogistics,
  9: Step9BudgetReusability,
  10: Step10FinalNotes,
};

function WizardContent() {
  const { state, dispatch, nextStep, prevStep, goToStep } = useFormContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save hook
  const { isSaving, lastSaved, saveError, saveDraft } =
    useCourseRequestAutoSave(state.formData, state.draftId, {
      debounceMs: 2000,
      enabled: true,
    });

  const CurrentStepComponent =
    stepComponents[state.currentStep as keyof typeof stepComponents];

  // Update last saved in context when auto-save completes
  useEffect(() => {
    if (lastSaved) {
      dispatch({ type: 'SET_LAST_SAVED', timestamp: lastSaved });
    }
  }, [lastSaved, dispatch]);

  // Validate current step
  const validateCurrentStep = (): boolean => {
    const errors: Record<string, string> = {};

    switch (state.currentStep) {
      case 1:
        if (!state.formData.fullName?.trim())
          errors.fullName = 'Full name is required';
        if (!state.formData.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          errors.email = 'Valid email is required';
        }
        if (!state.formData.role) errors.role = 'Role is required';
        break;

      case 2:
        if (!state.formData.studentName?.trim())
          errors.studentName = 'Student name is required';
        if (!state.formData.studentAge || state.formData.studentAge < 1) {
          errors.studentAge = 'Valid student age is required';
        }
        if (!state.formData.gradeLevel)
          errors.gradeLevel = 'Grade level is required';
        break;

      case 3:
        if (!state.formData.primarySubject)
          errors.primarySubject = 'Primary subject is required';
        if (!state.formData.learningGoal)
          errors.learningGoal = 'Learning goal is required';
        break;

      case 6:
        if (!state.formData.courseLength)
          errors.courseLength = 'Course length is required';
        if (!state.formData.sessionDuration)
          errors.sessionDuration = 'Session duration is required';
        break;

      case 8:
        if (!state.formData.urgencyLevel)
          errors.urgencyLevel = 'Urgency level is required';
        break;

      case 9:
        if (!state.formData.budgetTier)
          errors.budgetTier = 'Budget tier is required';
        if (!state.formData.allowCourseReuse)
          errors.allowCourseReuse = 'Please select a reuse option';
        break;

      case 10:
        if (!state.formData.consentGiven) {
          errors.consentGiven =
            'You must provide consent to submit the request';
        }
        break;
    }

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors });
      return false;
    }

    dispatch({ type: 'CLEAR_ERRORS' });
    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
    prevStep();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle manual save draft (from button)
  const handleSaveDraft = async () => {
    const result = await saveDraft();

    if (result.success && result.draftId && !state.draftId) {
      // Update draft ID in context if this was first save
      dispatch({
        type: 'LOAD_DRAFT',
        draftData: state.formData,
        draftId: result.draftId,
      });
    }

    if (!result.success) {
      alert(result.error || 'Failed to save draft. Please try again.');
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/course-requests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: state.draftId,
          ...state.formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      const data = await response.json();

      // Redirect to success page
      router.push(`/course-request/success?requestId=${data.requestId}`);
    } catch (error) {
      console.error('Error submitting request:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Failed to submit request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const response = await fetch('/api/course-requests/draft');
        if (response.ok) {
          const draft = await response.json();
          if (draft && draft.id) {
            dispatch({
              type: 'LOAD_DRAFT',
              draftData: draft,
              draftId: draft.id,
            });
            console.log('Draft loaded successfully');
          }
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    };

    loadDraft();
  }, [dispatch]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-ink-900 mb-3">
          Custom Course Request
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Help us create the perfect learning experience for your student. This
          form takes about 10-15 minutes to complete, and you can save your
          progress anytime.
        </p>
        {isSaving && (
          <p className="text-sm text-gray-500 mt-2 flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
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
            Saving draft...
          </p>
        )}
        {!isSaving && lastSaved && (
          <p className="text-sm text-accent-600 mt-2">
            ✓ Draft auto-saved at {lastSaved.toLocaleTimeString()}
          </p>
        )}
        {saveError && (
          <p className="text-sm text-coral-600 mt-2">⚠️ {saveError}</p>
        )}
      </div>

      {/* Progress Bar */}
      <FormProgressBar
        currentStep={state.currentStep}
        totalSteps={10}
        onStepClick={goToStep}
      />

      {/* Current Step Content */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <CurrentStepComponent />
      </div>

      {/* Navigation */}
      <FormNavigation
        currentStep={state.currentStep}
        totalSteps={10}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
        onSubmit={handleSubmit}
        isFirstStep={state.currentStep === 1}
        isLastStep={state.currentStep === 10}
        isSaving={isSaving}
        isSubmitting={isSubmitting}
        canProceed={Object.keys(state.errors).length === 0}
      />

      {/* Help Footer */}
      <div className="mt-8 text-center text-sm text-gray-600">
        <p>
          Need help?{' '}
          <a
            href="mailto:support@learningadventures.org"
            className="text-brand-600 hover:underline"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}

export default function CourseRequestWizard() {
  return (
    <FormProvider>
      <WizardContent />
    </FormProvider>
  );
}
