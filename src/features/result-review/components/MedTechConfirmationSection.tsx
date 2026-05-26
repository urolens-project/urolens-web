import { FlaskConical } from 'lucide-react';
import type { FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

export function MedTechConfirmationSection({ result }: Props) {
  const confirmedAt = result.confirmed_at
    ? new Date(result.confirmed_at).toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">MedTech Confirmation</h3>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Confirmed By</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">{result.medtech_name || '—'}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Confirmed At</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">{confirmedAt}</p>
        </div>
        {result.confirmation_notes && (
          <div className="col-span-2 sm:col-span-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Notes</p>
            <p className="mt-0.5 text-sm text-slate-700">{result.confirmation_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
