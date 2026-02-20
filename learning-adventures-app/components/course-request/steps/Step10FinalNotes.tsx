'use client';

import { useFormContext } from '../FormContext';
import TextAreaField from '../inputs/TextAreaField';

export default function Step10FinalNotes() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Final Notes & Consent
        </h2>
        <p className="text-gray-600">
          Any additional information and required consent
        </p>
      </div>

      {/* Additional Notes */}
      <TextAreaField
        label="Additional Notes or Special Requests"
        value={formData.additionalNotes || ''}
        onChange={(value) => updateField('additionalNotes', value)}
        placeholder="Is there anything else we should know? Any special considerations, goals, or concerns?"
        helpText="This is your space to share any details that didn't fit in the previous sections"
        rows={6}
        maxLength={2000}
        showCharacterCount
      />

      {/* Review Summary Box */}
      <div className="p-6 bg-gradient-to-br from-brand-50 to-ocean-50 border-2 border-brand-200 rounded-xl">
        <h3 className="text-lg font-bold text-ink-900 mb-3">
          📋 Request Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Requestor</p>
            <p className="font-semibold text-ink-900">
              {formData.fullName || 'Not provided'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Student</p>
            <p className="font-semibold text-ink-900">
              {formData.studentName || 'Not provided'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Subject</p>
            <p className="font-semibold text-ink-900">
              {formData.primarySubject
                ? formData.primarySubject.replace('_', ' ')
                : 'Not selected'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Grade Level</p>
            <p className="font-semibold text-ink-900">
              {formData.gradeLevel
                ? formData.gradeLevel === 'PRE_K'
                  ? 'Pre-K'
                  : formData.gradeLevel === 'K'
                    ? 'Kindergarten'
                    : `Grade ${formData.gradeLevel}`
                : 'Not selected'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Course Length</p>
            <p className="font-semibold text-ink-900">
              {formData.courseLength
                ? formData.courseLength.replace(/_/g, ' ')
                : 'Not selected'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Budget Tier</p>
            <p className="font-semibold text-ink-900">
              {formData.budgetTier || 'Not selected'}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-4 italic">
          You can go back to any section to make changes before submitting
        </p>
      </div>

      {/* Consent Checkbox */}
      <div className="space-y-4">
        <div
          className={`
            p-6 border-2 rounded-xl transition-all
            ${
              errors.consentGiven
                ? 'border-coral-500 bg-coral-50'
                : 'border-gray-200 bg-white'
            }
          `}
        >
          <label className="flex items-start gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.consentGiven || false}
              onChange={(e) => updateField('consentGiven', e.target.checked)}
              className="
                mt-1 w-6 h-6 rounded border-gray-300 text-brand-500
                focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                cursor-pointer
              "
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink-900 mb-2">
                Required Consent
                <span className="text-coral-500 ml-1">*</span>
              </p>
              <div className="text-sm text-gray-700 space-y-2">
                <p>By checking this box, I confirm that:</p>
                <ul className="ml-4 space-y-1">
                  <li>
                    • I have the authority to request this custom course on
                    behalf of the student(s)
                  </li>
                  <li>
                    • The information provided is accurate to the best of my
                    knowledge
                  </li>
                  <li>
                    • I understand that course development timelines depend on
                    the selected urgency level
                  </li>
                  <li>
                    • I agree to the platform's{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      className="text-brand-600 hover:underline"
                    >
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-brand-600 hover:underline"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    • I consent to receiving email updates about this course
                    request
                  </li>
                </ul>
              </div>
            </div>
          </label>
          {errors.consentGiven && (
            <p className="text-sm text-coral-600 mt-3 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {errors.consentGiven}
            </p>
          )}
        </div>
      </div>

      {/* What Happens Next */}
      <div className="p-6 bg-sunshine-50 border border-sunshine-200 rounded-xl">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-3xl">🎉</div>
          <div>
            <h4 className="text-lg font-bold text-ink-900 mb-2">
              What Happens After You Submit?
            </h4>
            <ol className="text-sm text-gray-700 space-y-2 ml-4 list-decimal">
              <li>
                <strong>Confirmation Email</strong> - You'll receive an email
                confirming we received your request
              </li>
              <li>
                <strong>Review (24-48 hours)</strong> - Our team reviews your
                request and may reach out with clarifying questions
              </li>
              <li>
                <strong>Quote & Timeline</strong> - We'll send a detailed quote
                and development timeline
              </li>
              <li>
                <strong>Course Development</strong> - Our AI + human team
                creates your custom content
              </li>
              <li>
                <strong>Review & Launch</strong> - You'll get a preview to
                approve before final delivery
              </li>
              <li>
                <strong>Ongoing Support</strong> - We'll check in to ensure the
                course is meeting your goals
              </li>
            </ol>
            <p className="text-sm text-gray-700 mt-4 font-semibold">
              Questions? Email us at{' '}
              <a
                href="mailto:support@learningadventures.org"
                className="text-brand-600 hover:underline"
              >
                support@learningadventures.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
