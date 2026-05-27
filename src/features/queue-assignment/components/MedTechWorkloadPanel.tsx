import { User, CheckCircle2 } from 'lucide-react';
import type { MedTechWorkloadItem } from '../types';

interface MedTechWorkloadPanelProps {
  workloads: MedTechWorkloadItem[];
  selectedMedTechId: string | null;
  onSelect: (user_id: string) => void;
  isLoading: boolean;
}

function workloadBadge(count: number): { label: string; className: string } {
  if (count <= 3) return { label: `${count} active`, className: 'bg-emerald-100 text-emerald-700' };
  if (count <= 6) return { label: `${count} active`, className: 'bg-amber-100 text-amber-700' };
  return { label: `${count} active`, className: 'bg-rose-100 text-rose-700' };
}

function barColor(count: number): string {
  if (count <= 3) return 'bg-emerald-500';
  if (count <= 6) return 'bg-amber-500';
  return 'bg-rose-500';
}

const Header = () => (
  <div className="px-8 py-6 border-b border-slate-100 bg-linear-to-r from-emerald-50 to-white">
    <h2 className="text-lg font-bold text-slate-900">Medical Technologists</h2>
    <p className="text-sm text-slate-500 mt-0.5">Select a MedTech to assign — least-loaded first.</p>
  </div>
);

export function MedTechWorkloadPanel({
  workloads,
  selectedMedTechId,
  onSelect,
  isLoading,
}: MedTechWorkloadPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <Header />
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
        <Header />
        <div className="p-8 text-center">
          <User className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No active Medical Technologists available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
      <Header />
      <div className="p-4 space-y-2 max-h-125 overflow-y-auto">
        {workloads.map((mt) => {
          const isSelected = selectedMedTechId === mt.user_id;
          const badge = workloadBadge(mt.active_count);
          const bar = barColor(mt.active_count);
          return (
            <button
              key={mt.user_id}
              type="button"
              onClick={() => onSelect(mt.user_id)}
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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900 truncate">{mt.full_name}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden max-w-48">
                  <div
                    className={`h-full rounded-full transition-all ${bar}`}
                    style={{ width: `${Math.min((mt.active_count / 10) * 100, 100)}%` }}
                  />
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
