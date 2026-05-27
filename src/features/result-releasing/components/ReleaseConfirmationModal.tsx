import { Loader2, Printer, Smartphone } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import type { ApprovedResultItem, ReleaseMethod } from '../types';

interface ReleaseConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (method: ReleaseMethod) => void;
  isPending: boolean;
  result: ApprovedResultItem | null;
  selectedMethod: ReleaseMethod | null;
  onSelectMethod: (method: ReleaseMethod) => void;
}

const METHODS: { value: ReleaseMethod; label: string; description: string; icon: typeof Printer }[] = [
  {
    value: 'PHYSICAL',
    label: 'Physical Printout',
    description: 'Print result and hand to patient directly.',
    icon: Printer,
  },
  {
    value: 'DIGITAL',
    label: 'Digital Delivery',
    description: 'Notify patient and physician via the portal.',
    icon: Smartphone,
  },
];

export function ReleaseConfirmationModal({
  open,
  onClose,
  onConfirm,
  isPending,
  result,
  selectedMethod,
  onSelectMethod,
}: ReleaseConfirmationModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Release Result" maxWidth="sm">
      <div className="space-y-4">
        {result && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-sm font-semibold text-slate-800">{result.patient_name}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {result.sample_uid ?? '—'} · {result.test_type ?? '—'}
            </p>
          </div>
        )}

        <p className="text-sm text-slate-600 font-medium">Select release method:</p>

        <div className="space-y-2">
          {METHODS.map(({ value, label, description, icon: Icon }) => {
            const isSelected = selectedMethod === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => onSelectMethod(value)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-white border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40'
                }`}
              >
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                  isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${isSelected ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {label}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                </div>
                <div className={`ml-auto h-4 w-4 shrink-0 rounded-full border-2 ${
                  isSelected ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                }`} />
              </button>
            );
          })}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => selectedMethod && onConfirm(selectedMethod)}
            disabled={!selectedMethod || isPending}
            className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Releasing…
              </>
            ) : (
              'Confirm Release'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}