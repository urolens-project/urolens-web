import { Brain, Clock } from 'lucide-react';
import type { FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

export function SmartDiagnosisSectionPlaceholder({ result }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-violet-50 border-b border-violet-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
          <Brain className="h-3.5 w-3.5 text-violet-600" />
        </div>
        <h3 className="text-xs font-bold text-violet-800 uppercase tracking-widest">Smart Diagnosis</h3>
      </div>

      <div className="p-5">
        {result.smart_diagnosis_unavailable ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Smart Diagnosis engine was unavailable for this specimen.
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8">
            <Clock className="h-6 w-6 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">Smart Diagnosis Panel</p>
            <p className="text-xs text-slate-400">Available after WEB-09 is merged.</p>
          </div>
        )}
      </div>
    </div>
  );
}
