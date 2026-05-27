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
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border-b border-emerald-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
          <FlaskConical className="h-3.5 w-3.5 text-emerald-600" />
        </div>
        <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">MedTech Confirmation</h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-slate-100">
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confirmed By</p>
          <p className="text-sm font-semibold text-slate-800">{result.medtech_name || '—'}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confirmed At</p>
          <p className="text-sm font-semibold text-slate-800">{confirmedAt}</p>
        </div>
        {result.confirmation_notes && (
          <div className="col-span-2 sm:col-span-3 px-5 py-4 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Notes</p>
            <p className="text-sm text-slate-700">{result.confirmation_notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
