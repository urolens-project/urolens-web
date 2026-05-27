import { FlaskConical, Clock, CheckCircle2, User, TestTube } from 'lucide-react';
import type { PendingSpecimenItem } from '../types';

interface PendingSpecimenListProps {
  specimens: PendingSpecimenItem[];
  selectedSpecimenId: string | null;
  onSelect: (specimen_id: string) => void;
  isLoading: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

const Header = () => (
  <div className="px-8 py-6 border-b border-slate-100 bg-linear-to-r from-emerald-50 to-white">
    <h2 className="text-lg font-bold text-slate-900">Pending Specimens</h2>
    <p className="text-sm text-slate-500 mt-0.5">Labeled specimens awaiting assignment — oldest first.</p>
  </div>
);

export function PendingSpecimenList({
  specimens,
  selectedSpecimenId,
  onSelect,
  isLoading,
}: PendingSpecimenListProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <Header />
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (specimens.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <Header />
        <div className="p-8 text-center">
          <FlaskConical className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No labeled specimens awaiting assignment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <Header />
      <div className="p-4 space-y-2 max-h-125 overflow-y-auto">
        {specimens.map((specimen) => {
          const isSelected = selectedSpecimenId === specimen.specimen_id;
          return (
            <button
              key={specimen.specimen_id}
              type="button"
              onClick={() => onSelect(specimen.specimen_id)}
              className={`w-full flex items-center gap-4 rounded-2xl border p-4 transition-all text-left ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">
                  {specimen.sample_uid}
                </p>
                <div className="mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <User className="h-3 w-3" />
                    {specimen.patient_uid}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <TestTube className="h-3 w-3" />
                    {specimen.test_type}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3 w-3" />
                  {formatDate(specimen.received_at)}
                </p>
              </div>
              {isSelected && (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
