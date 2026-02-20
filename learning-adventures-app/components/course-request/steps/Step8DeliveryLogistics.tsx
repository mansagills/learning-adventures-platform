'use client';

import { useFormContext } from '../FormContext';
import RadioGroup from '../inputs/RadioGroup';
import MultiSelectCheckbox from '../inputs/MultiSelectCheckbox';
import DatePicker from '../inputs/DatePicker';

const urgencyOptions = [
  {
    label: 'No Rush',
    value: 'LOW',
    icon: '🐢',
    description: '4-6 weeks delivery time',
  },
  {
    label: 'Standard',
    value: 'STANDARD',
    icon: '📅',
    description: '2-3 weeks delivery time (most common)',
  },
  {
    label: 'Priority',
    value: 'HIGH',
    icon: '⚡',
    description: '1-2 weeks delivery time',
  },
  {
    label: 'Urgent',
    value: 'URGENT',
    icon: '🚨',
    description: 'Less than 1 week (additional fees may apply)',
  },
];

const deviceOptions = [
  {
    label: 'Desktop/Laptop Computer',
    value: 'DESKTOP',
    description: 'Full browser access, keyboard & mouse',
  },
  {
    label: 'Tablet (iPad, Android)',
    value: 'TABLET',
    description: 'Touch-friendly interface',
  },
  {
    label: 'Smartphone',
    value: 'SMARTPHONE',
    description: 'Mobile-optimized experience',
  },
  {
    label: 'Chromebook',
    value: 'CHROMEBOOK',
    description: 'School-issued device',
  },
  {
    label: 'Smart TV / Large Screen',
    value: 'TV',
    description: 'Display content on TV',
  },
];

const offlineOptions = [
  {
    label: 'No, Digital Only',
    value: 'NO',
    icon: '💻',
    description: 'All activities online',
  },
  {
    label: 'Yes, Some Printables',
    value: 'SOME',
    icon: '🖨️',
    description: 'Include worksheets and activities to print',
  },
  {
    label: 'Yes, Full Offline Option',
    value: 'FULL',
    icon: '📦',
    description: 'Complete course available as printable packet',
  },
];

export default function Step8DeliveryLogistics() {
  const { state, updateField } = useFormContext();
  const { formData, errors } = state;

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ink-900 mb-2">
          Delivery & Logistics
        </h2>
        <p className="text-gray-600">
          When and how should the course be delivered?
        </p>
      </div>

      {/* Preferred Start Date */}
      <DatePicker
        label="Preferred Start Date"
        value={formData.preferredStartDate || ''}
        onChange={(value) => updateField('preferredStartDate', value)}
        minDate={today}
        helpText="When would you like the student to begin this course?"
        error={errors.preferredStartDate}
      />

      {/* Urgency Level */}
      <RadioGroup
        label="Urgency Level"
        value={formData.urgencyLevel || 'STANDARD'}
        onChange={(value) => updateField('urgencyLevel', value)}
        options={urgencyOptions}
        error={errors.urgencyLevel}
        required
        layout="vertical"
      />

      {/* Device Preferences */}
      <MultiSelectCheckbox
        label="Devices That Will Be Used"
        value={formData.devicePreferences || []}
        onChange={(value) => updateField('devicePreferences', value)}
        options={deviceOptions}
        error={errors.devicePreferences}
      />

      {/* Offline Packets */}
      <RadioGroup
        label="Offline/Printable Materials"
        value={formData.offlinePacketsNeeded || 'NO'}
        onChange={(value) => updateField('offlinePacketsNeeded', value)}
        options={offlineOptions}
        error={errors.offlinePacketsNeeded}
        required
        layout="vertical"
      />

      {/* Informational Boxes */}
      <div className="space-y-4">
        {/* Timeline Note */}
        <div className="p-4 bg-sunshine-50 border border-sunshine-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">⏰</div>
            <div>
              <h4 className="font-semibold text-ink-900 mb-1">
                Course Development Timeline
              </h4>
              <p className="text-sm text-gray-700">
                <strong>Standard delivery (2-3 weeks)</strong> allows our team
                to:
              </p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4 mt-1">
                <li>• Generate AI-powered content tailored to your needs</li>
                <li>• Have human educators review and refine materials</li>
                <li>• Test games and activities for quality</li>
                <li>• Create engaging visuals and multimedia</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                Rush orders are available but may have limited customization
                options.
              </p>
            </div>
          </div>
        </div>

        {/* Device Compatibility */}
        <div className="p-4 bg-ocean-50 border border-ocean-200 rounded-lg">
          <div className="flex gap-3">
            <div className="flex-shrink-0 text-2xl">📱</div>
            <div>
              <h4 className="font-semibold text-ink-900 mb-1">
                Multi-Device Compatibility
              </h4>
              <p className="text-sm text-gray-700">
                All courses are designed to work across devices. Knowing your
                primary devices helps us optimize the experience (e.g., larger
                touch targets for tablets, keyboard shortcuts for desktops).
              </p>
            </div>
          </div>
        </div>

        {/* Offline Options */}
        {formData.offlinePacketsNeeded &&
          formData.offlinePacketsNeeded !== 'NO' && (
            <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
              <div className="flex gap-3">
                <div className="flex-shrink-0 text-2xl">🖨️</div>
                <div>
                  <h4 className="font-semibold text-ink-900 mb-1">
                    Printable Materials
                  </h4>
                  <p className="text-sm text-gray-700">
                    We'll include downloadable PDFs with worksheets, activity
                    guides, and offline alternatives for key lessons. Great for
                    students with limited screen time or internet access!
                  </p>
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
