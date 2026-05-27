import { User } from 'lucide-react';
import type { FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

function Cell({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="px-5 py-4">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

export function PatientInfoSection({ result }: Props) {
  const sex = result.patient_sex
    ? result.patient_sex.charAt(0) + result.patient_sex.slice(1).toLowerCase()
    : null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-indigo-50 border-b border-indigo-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
          <User className="h-3.5 w-3.5 text-indigo-600" />
        </div>
        <h3 className="text-xs font-bold text-indigo-800 uppercase tracking-widest">Patient Information</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100">
        <Cell label="Full Name" value={result.patient_name} />
        <Cell label="Age" value={result.patient_age != null ? `${result.patient_age} yrs` : '—'} />
        <Cell label="Sex" value={sex} />
        <Cell label="Specimen ID" value={result.specimen_id.slice(0, 8).toUpperCase()} />
      </div>
    </div>
  );
}
