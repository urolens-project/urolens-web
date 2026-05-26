import { User } from 'lucide-react';
import type { FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

function LabelValue({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-800">{value || '—'}</p>
    </div>
  );
}

export function PatientInfoSection({ result }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <User className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Patient Information</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <LabelValue label="Full Name" value={result.patient_name} />
        <LabelValue
          label="Age"
          value={result.patient_age !== null ? `${result.patient_age} yrs` : '—'}
        />
        <LabelValue
          label="Sex"
          value={result.patient_sex
            ? result.patient_sex.charAt(0) + result.patient_sex.slice(1).toLowerCase()
            : null}
        />
        <LabelValue label="Specimen ID" value={result.specimen_id.slice(0, 8).toUpperCase()} />
      </div>
    </div>
  );
}
