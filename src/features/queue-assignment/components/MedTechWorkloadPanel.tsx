import { User, CheckCircle2 } from 'lucide-react';
import type { MedTechWorkload } from '../types';

interface MedTechWorkloadPanelProps {
  workloads: MedTechWorkload[];
  selectedMedTechId: string | null;
  onSelect: (medtech_id: string) => void;
  isLoading: boolean;
}

export function MedTechWorkloadPanel({
  workloads,
  selectedMedTechId,
  onSelect,
  isLoading,
}: MedTechWorkloadPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
          <h2 className="text-lg font-bold text-slate-900">Medical Technologists</h2>
          <p className="text-sm text-slate-500 mt-0.5">Select a MedTech for assignment.</p>
        </div>
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (workloads.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
          <h2 className="text-lg font-bold text-slate-900">Medical Technologists</h2>
          <p className="text-sm text-slate-500 mt-0.5">Select a MedTech for assignment.</p>
        </div>
        <div className="p-8 text-center">
          <p className="text-sm text-slate-400">No active Medical Technologists available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
        <h2 className="text-lg font-bold text-slate-900">Medical Technologists</h2>
        <p className="text-sm text-slate-500 mt-0.5">Select a MedTech for assignment.</p>
      </div>
      <div className="p-4 space-y-2">
        {workloads.map((mt) => {
          const isSelected = selectedMedTechId === mt.medtech_id;
          return (
            <button
              key={mt.medtech_id}
              type="button"
              onClick={() => onSelect(mt.medtech_id)}
              className={`w-full flex items-center gap-4 rounded-2xl border p-4 transition-all text-left ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:border-emerald-200 hover:bg-emerald-50/40'
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <User className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900 truncate">{mt.username}</p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden max-w-32">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${Math.min((mt.queue_count / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-500 tabular-nums">
                    {mt.queue_count} in queue
                  </span>
                </div>
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
