import { useEffect, useRef, useState } from 'react';
import { FormData } from '@/components/course-request/FormContext';

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  saveError: string | null;
}

interface AutoSaveOptions {
  debounceMs?: number;
  enabled?: boolean;
}

export function useCourseRequestAutoSave(
  formData: FormData,
  draftId: string | null,
  options: AutoSaveOptions = {}
) {
  const { debounceMs = 2000, enabled = true } = options;

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    saveError: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>('');
  const isFirstRenderRef = useRef(true);

  // Manual save function
  const saveDraft = async (): Promise<{
    success: boolean;
    draftId?: string;
    error?: string;
  }> => {
    setState((prev) => ({ ...prev, isSaving: true, saveError: null }));

    try {
      const response = await fetch('/api/course-requests/draft', {
        method: draftId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draftId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save draft');
      }

      const data = await response.json();

      setState({
        isSaving: false,
        lastSaved: new Date(),
        saveError: null,
      });

      // Store draft ID in localStorage for recovery
      if (data.id) {
        localStorage.setItem('courseRequestDraftId', data.id);
      }

      return { success: true, draftId: data.id };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save draft';

      setState({
        isSaving: false,
        lastSaved: null,
        saveError: errorMessage,
      });

      return { success: false, error: errorMessage };
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    // Skip on first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // Serialize current form data
    const currentData = JSON.stringify(formData);

    // Check if data actually changed
    if (currentData === previousDataRef.current) {
      return;
    }

    // Update previous data reference
    previousDataRef.current = currentData;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, debounceMs);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, enabled, debounceMs, draftId]);

  return {
    ...state,
    saveDraft,
  };
}
