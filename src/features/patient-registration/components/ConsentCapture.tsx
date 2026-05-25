import { ShieldCheck } from 'lucide-react';
import type { ConsentData } from '../types';

interface ConsentCaptureProps {
  value: ConsentData;
  onChange: (value: ConsentData) => void;
  showErrors: boolean;
}

const CONSENT_ITEMS: { key: keyof ConsentData; label: string }[] = [
  {
    key: 'consent_given',
    label:
      'I consent to the collection and use of my personal and health information for the purpose of laboratory testing.',
  },
  {
    key: 'consent_storage',
    label:
      'I consent to the storage of my personal and health information in the UroLens system.',
  },
  {
    key: 'consent_research',
    label:
      'I consent to the use of anonymized data for research and quality improvement purposes.',
  },
];

export function ConsentCapture({ value, onChange, showErrors }: ConsentCaptureProps) {
  const handleCheckboxChange = (key: keyof ConsentData) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 bg-linear-to-r from-emerald-50 to-white">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Data Privacy Consent</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              All three consent options must be confirmed before registration.
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-5">
        {CONSENT_ITEMS.map((item) => {
          const isChecked = value[item.key];
          const hasError = showErrors && !isChecked;

          return (
            <div key={item.key}>
              <label
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleCheckboxChange(item.key)}
                  className="mt-0.5 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-slate-700 leading-relaxed">{item.label}</span>
              </label>
              {hasError && (
                <p className="mt-1.5 ml-11 text-xs font-medium text-red-500">
                  This consent is required.
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
