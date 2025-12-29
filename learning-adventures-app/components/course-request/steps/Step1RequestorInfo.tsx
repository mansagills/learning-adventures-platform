'use client';

import { useFormContext } from '../FormContext';
import RadioGroup from '../inputs/RadioGroup';

const roleOptions = [
  { label: 'Parent', value: 'PARENT', description: 'Guardian or parent of the student' },
  { label: 'Teacher', value: 'TEACHER', description: 'Classroom teacher or educator' },
  { label: 'Tutor', value: 'TUTOR', description: 'Private tutor or learning specialist' },
  { label: 'Other', value: 'OTHER', description: 'Other relationship to student' },
];

const contactMethodOptions = [
  {
    label: 'Email',
    value: 'EMAIL',
    icon: '📧',
    description: 'Preferred for detailed updates'
  },
  {
    label: 'Phone',
    value: 'PHONE',
    icon: '📱',
    description: 'Quick calls for urgent matters'
  },
  {
    label: 'Text Message',
    value: 'SMS',
    icon: '💬',
    description: 'Brief updates via text'
  },
];

export default function Step1RequestorInfo() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Requestor Information
        </h2>
        <p className="text-gray-600">
          Tell us who you are and how we can reach you
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-ink-900">
          Full Name
          <span className="text-coral-500 ml-1">*</span>
        </label>
        <input
          type="text"
          value={formData.fullName || ''}
          onChange={(e) => updateField('fullName', e.target.value)}
          placeholder="Enter your full name"
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            ${errors.fullName
              ? 'border-coral-500 bg-coral-50'
              : 'border-gray-200 bg-white hover:border-brand-300'
            }
          `}
        />
        {errors.fullName && (
          <p className="text-sm text-coral-600">{errors.fullName}</p>
        )}
      </div>

      {/* Role */}
      <RadioGroup
        label="Your Role"
        value={formData.role || ''}
        onChange={(value) => updateField('role', value)}
        options={roleOptions}
        error={errors.role}
        required
        layout="vertical"
      />

      {/* Email */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-ink-900">
          Email Address
          <span className="text-coral-500 ml-1">*</span>
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder="your.email@example.com"
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
            ${errors.email
              ? 'border-coral-500 bg-coral-50'
              : 'border-gray-200 bg-white hover:border-brand-300'
            }
          `}
        />
        {errors.email && (
          <p className="text-sm text-coral-600">{errors.email}</p>
        )}
      </div>

      {/* Phone (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-ink-900">
          Phone Number
          <span className="text-gray-500 text-xs ml-2">(Optional)</span>
        </label>
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => updateField('phone', e.target.value)}
          placeholder="(555) 123-4567"
          className="
            w-full px-4 py-3 rounded-lg border-2 transition-all
            border-gray-200 bg-white hover:border-brand-300
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          "
        />
      </div>

      {/* Organization (Optional) */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-ink-900">
          School/Organization
          <span className="text-gray-500 text-xs ml-2">(Optional)</span>
        </label>
        <input
          type="text"
          value={formData.organization || ''}
          onChange={(e) => updateField('organization', e.target.value)}
          placeholder="e.g., Sunshine Elementary School"
          className="
            w-full px-4 py-3 rounded-lg border-2 transition-all
            border-gray-200 bg-white hover:border-brand-300
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          "
        />
      </div>

      {/* Preferred Contact Method */}
      <RadioGroup
        label="Preferred Contact Method"
        value={formData.preferredContact || 'EMAIL'}
        onChange={(value) => updateField('preferredContact', value)}
        options={contactMethodOptions}
        error={errors.preferredContact}
        required
        layout="horizontal"
      />

      {/* Help Text */}
      <div className="mt-6 p-4 bg-ocean-50 border border-ocean-200 rounded-lg">
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-2xl">ℹ️</div>
          <div>
            <h4 className="font-semibold text-ink-900 mb-1">
              Why we need this information
            </h4>
            <p className="text-sm text-gray-700">
              We'll use your contact details to send updates about your course request,
              answer questions, and coordinate delivery of your custom learning materials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
