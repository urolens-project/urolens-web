import { PencilLine } from 'lucide-react';
import type { FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

export function ManualOverridesSection({ result }: Props) {
  const { manual_overrides } = result;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <PencilLine className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          Manual Overrides
          {manual_overrides.length > 0 && (
            <span className="ml-2 text-xs font-normal text-slate-400">({manual_overrides.length})</span>
          )}
        </h3>
      </div>

      {manual_overrides.length === 0 ? (
        <p className="text-sm text-slate-400">No manual overrides recorded.</p>
      ) : (
        <div className="space-y-3">
          {manual_overrides.map((override) => (
            <div
              key={override.override_id}
              className="rounded-xl border border-amber-100 bg-amber-50 p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-amber-800 capitalize">
                  {override.parameter_name.replace(/_/g, ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(override.overridden_at).toLocaleString('en-PH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs mb-1.5">
                <span className="text-slate-500">AI:</span>
                <span className="line-through text-slate-400">{override.original_ai_value}</span>
                <span className="text-slate-400">→</span>
                <span className="font-semibold text-slate-800">{override.corrected_value}</span>
              </div>
              <p className="text-xs text-slate-600">
                <span className="font-medium">Rationale: </span>
                {override.rationale}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
