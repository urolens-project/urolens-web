import { Brain, Clock } from 'lucide-react';
import type { FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

export function SmartDiagnosisSectionPlaceholder({ result }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Smart Diagnosis</h3>
      </div>

      {result.smart_diagnosis_unavailable ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Smart Diagnosis engine was unavailable for this specimen.
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8">
          <Clock className="h-6 w-6 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Smart Diagnosis Panel</p>
          <p className="text-xs text-slate-400">Available after WEB-09 is merged.</p>
        </div>
      )}
    </div>
  );
}
