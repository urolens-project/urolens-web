import { PencilLine } from 'lucide-react';
import type { FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

export function ManualOverridesSection({ result }: Props) {
  const manual_overrides = result.manual_overrides ?? [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-amber-50 border-b border-amber-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
          <PencilLine className="h-3.5 w-3.5 text-amber-600" />
        </div>
        <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest">
          Manual Overrides
        </h3>
        {manual_overrides.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">
            {manual_overrides.length}
          </span>
        )}
      </div>

      <div className="p-5">
        {manual_overrides.length === 0 ? (
          <p className="text-sm text-slate-400">No manual overrides recorded.</p>
        ) : (
          <div className="space-y-3">
            {manual_overrides.map((override) => (
              <div
                key={override.override_id}
                className="rounded-xl border border-amber-100 bg-amber-50 p-3.5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-800 capitalize">
                    {override.parameter_name.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(override.overridden_at).toLocaleString('en-PH', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs mb-2">
                  <span className="text-slate-400">AI value:</span>
                  <span className="line-through text-slate-400 font-mono">{override.original_ai_value}</span>
                  <span className="text-slate-400">→</span>
                  <span className="font-bold text-slate-800 font-mono">{override.corrected_value}</span>
                </div>
                <p className="text-xs text-slate-600 bg-white/70 rounded-lg px-2.5 py-1.5 border border-amber-100">
                  <span className="font-medium text-amber-700">Rationale: </span>
                  {override.rationale}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
