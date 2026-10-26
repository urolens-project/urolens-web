// Proposal §10.1 VerificationSummary: final averages with range and
// total, AI average beside it, corrections list, final Smart Diagnosis
// preview, interpretation notes, Confirm. Reads GET
// /results/{id}/summary (field-shapes.json: VerificationSummaryResponse)
// — the numbers confirmation will actually store, computed the same
// way confirmation computes them, so this screen never shows a
// different number than what gets saved.
import { AlertTriangle, CheckCircle2, ClipboardList, Pencil, Target } from 'lucide-react';
import { PARTICLE_LABEL_DISPLAY } from '../../result-review/constants';
import { useVerificationSummary } from '../hooks/useFieldVerification';
import type { ParticleAggregate } from '../types';

interface Props {
  resultId: string;
}

function AggregateRow({ particleKey, agg }: { particleKey: string; agg: ParticleAggregate }) {
  return (
    <tr className="hover:bg-slate-50/80 transition-colors">
      <td className="px-4 py-2.5 text-sm font-medium text-slate-700">
        {PARTICLE_LABEL_DISPLAY[particleKey] ?? particleKey}
      </td>
      <td className="px-4 py-2.5 text-right text-sm font-bold text-slate-900 tabular-nums">
        {agg.display_value}
      </td>
      <td className="px-4 py-2.5 text-right text-xs text-slate-400 tabular-nums">
        {agg.min}–{agg.max}
      </td>
      <td className="px-4 py-2.5 text-right text-xs text-slate-400 tabular-nums">{agg.total}</td>
      <td className="px-4 py-2.5 text-right text-xs text-slate-400 tabular-nums">{agg.ai_mean}</td>
      <td className="px-4 py-2.5 text-right text-xs text-slate-400 tabular-nums">
        {agg.fields_seen}
      </td>
    </tr>
  );
}

export function VerificationSummary({ resultId }: Props) {
  const { data, isLoading, isError } = useVerificationSummary(resultId);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-400">
        Loading summary…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load the verification summary.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 ${
          data.can_confirm ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'
        }`}
      >
        {data.can_confirm ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
        )}
        <p className={`text-sm ${data.can_confirm ? 'text-emerald-800' : 'text-amber-800'}`}>
          {data.can_confirm
            ? 'Ready to confirm for supervisor review.'
            : data.blocking_reason === 'FIELDS_BELOW_MINIMUM'
              ? `At least ${data.min_fields} accepted fields are needed (${data.field_count} so far).`
              : data.blocking_reason === 'FIELDS_NOT_VERIFIED'
                ? 'Every accepted field must be marked checked before confirming.'
                : 'This result cannot be confirmed yet.'}
        </p>
      </div>

      {data.focal_findings.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center gap-2 mb-1.5">
            <Target className="h-3.5 w-3.5 text-red-600" />
            <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
              Focal findings — outliers an average could hide
            </p>
          </div>
          <ul className="space-y-1 text-sm text-red-800">
            {data.focal_findings.map((f) => (
              <li key={f.particle_type}>
                {PARTICLE_LABEL_DISPLAY[f.particle_type] ?? f.particle_type} above normal in field
                {f.field_nos.length !== 1 ? 's' : ''} {f.field_nos.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-emerald-100 bg-emerald-50">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
            <ClipboardList className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
              Final Averages
            </h3>
            <p className="text-[10px] text-emerald-400 uppercase tracking-widest mt-0.5">
              {data.field_count} fields examined
            </p>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-2 text-left text-[10px] font-bold text-slate-400 uppercase">
                Particle
              </th>
              <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-400 uppercase">
                Per Field
              </th>
              <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-400 uppercase">
                Range
              </th>
              <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-400 uppercase">
                Total
              </th>
              <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-400 uppercase">
                AI Avg
              </th>
              <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-400 uppercase">
                Fields Seen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(data.per_class).map(([key, agg]) => (
              <AggregateRow key={key} particleKey={key} agg={agg} />
            ))}
          </tbody>
        </table>
      </div>

      {data.corrections.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-amber-100 bg-amber-50">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
              <Pencil className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest">
              Corrections ({data.corrections.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-100">
            {data.corrections.map((c, i) => (
              <div
                key={`${c.field_id}-${c.particle_type}-${i}`}
                className="flex items-center justify-between px-5 py-2.5 text-sm"
              >
                <span className="text-slate-600">
                  Field {c.field_no} · {PARTICLE_LABEL_DISPLAY[c.particle_type] ?? c.particle_type}
                  <span className="ml-1.5 text-[10px] text-slate-400 uppercase">
                    {c.kind === 'OVERRIDE' ? 'override' : 'box edit'}
                  </span>
                </span>
                <span className="font-mono text-xs">
                  <span className="text-slate-400 line-through">{c.ai_value}</span>
                  <span className="text-slate-400"> → </span>
                  <span className="font-bold text-amber-700">{c.effective_value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.smart_diagnosis_unavailable && (
        <p className="text-xs text-slate-400">
          Smart Diagnosis preview is unavailable for this result.
        </p>
      )}
    </div>
  );
}
