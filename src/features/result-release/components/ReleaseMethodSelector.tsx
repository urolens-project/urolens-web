import { Printer, Send } from 'lucide-react';
import type { ReleaseMethod } from '../types';

interface ReleaseMethodSelectorProps {
  value: ReleaseMethod | null;
  onChange: (method: ReleaseMethod) => void;
}

const options: { method: ReleaseMethod; label: string; description: string; Icon: typeof Printer }[] = [
  {
    method: 'PHYSICAL',
    label: 'Physical Printout',
    description: 'Print and hand-deliver to patient',
    Icon: Printer,
  },
  {
    method: 'DIGITAL',
    label: 'Digital Delivery',
    description: 'Notify patient and physician electronically',
    Icon: Send,
  },
];

export function ReleaseMethodSelector({ value, onChange }: ReleaseMethodSelectorProps) {
  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label="Release method">
      {options.map(({ method, label, description, Icon }) => {
        const checked = value === method;
        return (
          <label
            key={method}
            className={`flex items-center gap-4 rounded-xl border-2 px-4 py-3 cursor-pointer transition-colors ${
              checked
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <input
              type="radio"
              name="release_method"
              value={method}
              checked={checked}
              onChange={() => onChange(method)}
              className="sr-only"
              aria-label={label}
            />
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                checked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="flex flex-col">
              <span className={`text-sm font-semibold ${checked ? 'text-emerald-700' : 'text-slate-800'}`}>
                {label}
              </span>
              <span className="text-xs text-slate-500">{description}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
