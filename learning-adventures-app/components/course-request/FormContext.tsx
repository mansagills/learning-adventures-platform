'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

// Form Data Types
export interface FormData {
  // Section 1: Requestor Information
  fullName: string;
  role: string;
  email: string;
  phone: string;
  organization: string;
  preferredContact: string;

  // Section 2: Student Profile
  studentName: string;
  studentAge: number | null;
  gradeLevel: string;
  numberOfStudents: string;
  learningAccommodations: string[];
  accommodationNotes: string;

  // Section 3: Subject & Focus
  primarySubject: string;
  specificTopics: string[];
  customTopics: string;
  learningGoal: string;

  // Section 4: Learning Challenges
  learningChallenges: string[];
  challengeObservations: string;

  // Section 5: Learning Style & Interests
  learningStyles: string[];
  studentInterests: string[];
  favoriteCharacters: string;

  // Section 6: Course Format
  courseLength: string;
  courseComponents: string[];
  sessionDuration: string;

  // Section 7: Assessment Criteria
  successIndicators: string[];
  reportingPreferences: string[];

  // Section 8: Delivery & Logistics
  preferredStartDate: string;
  urgencyLevel: string;
  devicePreferences: string[];
  offlinePacketsNeeded: string;

  // Section 9: Budget & Reusability
  budgetTier: string;
  allowCourseReuse: string;

  // Section 10: Final Notes & Consent
  additionalNotes: string;
  consentGiven: boolean;
}

export interface FormState {
  currentStep: number;
  formData: FormData;
  errors: Record<string, string>;
  isDraft: boolean;
  draftId: string | null;
  lastSaved: Date | null;
  isSaving: boolean;
}

// Action Types
export type FormAction =
  | { type: 'UPDATE_FIELD'; field: keyof FormData; value: any }
  | { type: 'UPDATE_STEP_DATA'; stepData: Partial<FormData> }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: number }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERRORS' }
  | { type: 'LOAD_DRAFT'; draftData: Partial<FormData>; draftId: string }
  | { type: 'SET_SAVING'; isSaving: boolean }
  | { type: 'SET_LAST_SAVED'; timestamp: Date }
  | { type: 'RESET_FORM' };

// Initial State
const initialFormData: FormData = {
  // Section 1
  fullName: '',
  role: '',
  email: '',
  phone: '',
  organization: '',
  preferredContact: 'EMAIL',

  // Section 2
  studentName: '',
  studentAge: null,
  gradeLevel: '',
  numberOfStudents: 'SINGLE',
  learningAccommodations: [],
  accommodationNotes: '',

  // Section 3
  primarySubject: '',
  specificTopics: [],
  customTopics: '',
  learningGoal: '',

  // Section 4
  learningChallenges: [],
  challengeObservations: '',

  // Section 5
  learningStyles: [],
  studentInterests: [],
  favoriteCharacters: '',

  // Section 6
  courseLength: '',
  courseComponents: [],
  sessionDuration: '',

  // Section 7
  successIndicators: [],
  reportingPreferences: [],

  // Section 8
  preferredStartDate: '',
  urgencyLevel: 'STANDARD',
  devicePreferences: [],
  offlinePacketsNeeded: 'NO',

  // Section 9
  budgetTier: '',
  allowCourseReuse: '',

  // Section 10
  additionalNotes: '',
  consentGiven: false,
};

const initialState: FormState = {
  currentStep: 1,
  formData: initialFormData,
  errors: {},
  isDraft: true,
  draftId: null,
  lastSaved: null,
  isSaving: false,
};

// Reducer
function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
      };

    case 'UPDATE_STEP_DATA':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.stepData,
        },
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, 10),
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(state.currentStep - 1, 1),
      };

    case 'GO_TO_STEP':
      return {
        ...state,
        currentStep: Math.max(1, Math.min(action.step, 10)),
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: {},
      };

    case 'LOAD_DRAFT':
      return {
        ...state,
        formData: {
          ...state.formData,
          ...action.draftData,
        },
        draftId: action.draftId,
        isDraft: true,
      };

    case 'SET_SAVING':
      return {
        ...state,
        isSaving: action.isSaving,
      };

    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.timestamp,
      };

    case 'RESET_FORM':
      return initialState;

    default:
      return state;
  }
}

// Context
interface FormContextType {
  state: FormState;
  dispatch: React.Dispatch<FormAction>;
  updateField: (field: keyof FormData, value: any) => void;
  updateStepData: (stepData: Partial<FormData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setErrors: (errors: Record<string, string>) => void;
  clearErrors: () => void;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider
export function FormProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, initialState);

  const contextValue: FormContextType = {
    state,
    dispatch,
    updateField: (field, value) => dispatch({ type: 'UPDATE_FIELD', field, value }),
    updateStepData: (stepData) => dispatch({ type: 'UPDATE_STEP_DATA', stepData }),
    nextStep: () => dispatch({ type: 'NEXT_STEP' }),
    prevStep: () => dispatch({ type: 'PREV_STEP' }),
    goToStep: (step) => dispatch({ type: 'GO_TO_STEP', step }),
    setErrors: (errors) => dispatch({ type: 'SET_ERRORS', errors }),
    clearErrors: () => dispatch({ type: 'CLEAR_ERRORS' }),
  };

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
}

// Custom Hook
export function useFormContext() {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }

  return context;
}

// Export types for use in step components
export type { FormContextType };
