import { useState } from 'react';
import { Bot, Pencil, Check, X } from 'lucide-react';
import { useSaveOverride } from '../hooks/useResultReview';
import type { FullResultDetail, ManualOverrideItem } from '../types';

interface Props {
  result: FullResultDetail;
}

function toTitle(key: string) {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getEffectiveValue(key: string, overrides: ManualOverrideItem[]): string | null {
  const match = [...overrides].reverse().find((o) => o.parameter_name === key);
  return match ? match.corrected_value : null;
}

interface EditableRowProps {
  paramKey: string;
  aiValue: number;
  overrides: ManualOverrideItem[];
  resultId: string;
}

function EditableRow({ paramKey, aiValue, overrides, resultId }: EditableRowProps) {
  const effective = getEffectiveValue(paramKey, overrides);
  const displayValue = effective ?? String(aiValue);

  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(displayValue);
  const [rationale, setRationale] = useState('');
  const [localSaved, setLocalSaved] = useState(false);

  const mutation = useSaveOverride(resultId);

  function startEdit() {
    setInputVal(displayValue);
    setRationale('');
    setEditing(true);
    setLocalSaved(false);
  }

  function cancel() {
    setEditing(false);
  }

  async function confirm() {
    const num = parseFloat(inputVal);
    if (isNaN(num) || num < 0 || !rationale.trim()) return;
    await mutation.mutateAsync({ parameter: paramKey, correctedValue: num, rationale: rationale.trim() });
    setLocalSaved(true);
    setEditing(false);
    setTimeout(() => setLocalSaved(false), 2000);
  }

  const hasOverride = !!effective;
  const isChanged = inputVal !== displayValue;

  return (
    <div className={`rounded-xl border p-3 transition-colors ${hasOverride ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-500 capitalize">{toTitle(paramKey)}</p>
          {!editing ? (
            <div className="mt-0.5 flex items-center gap-2">
              {hasOverride && (
                <span className="text-xs text-slate-400 line-through">{aiValue}</span>
              )}
              <span className={`text-sm font-bold ${hasOverride ? 'text-amber-700' : 'text-slate-800'}`}>
                {displayValue}
              </span>
              {localSaved && <span className="text-xs text-emerald-600 font-medium">Saved!</span>}
            </div>
          ) : (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 line-through">{aiValue}</span>
                <span className="text-xs text-slate-400">→</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  autoFocus
                />
              </div>
              <textarea
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                placeholder="Reason for correction (required)…"
                rows={2}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {mutation.isError && (
                <p className="text-xs text-red-600">Save failed. Check value and rationale.</p>
              )}
            </div>
          )}
        </div>

        {!editing ? (
          <button
            onClick={startEdit}
            className="mt-0.5 flex-shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
            title="Correct this value"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="flex gap-1 mt-0.5">
            <button
              onClick={confirm}
              disabled={!isChanged || !rationale.trim() || mutation.isPending}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Save correction"
            >
              <Check className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={cancel}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 transition-colors"
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AIFindingsSection({ result }: Props) {
  const numericFindings = Object.entries(result.ai_findings ?? {}).filter(
    ([, v]) => typeof v === 'number'
  );

  const hasFindings =
    numericFindings.length > 0 ||
    Object.keys(result.flagged_anomalies ?? {}).length > 0 ||
    Object.keys(result.particle_classes ?? {}).length > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">AI Findings</h3>
        </div>
        <span className="text-xs text-slate-400">Model: {result.model_version}</span>
      </div>

      {!hasFindings ? (
        <p className="text-sm text-slate-400">No AI findings available.</p>
      ) : (
        <div className="space-y-4">
          {numericFindings.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Findings
                <span className="ml-2 font-normal normal-case text-slate-400">— click ✏ to correct a value</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {numericFindings.map(([key, val]) => (
                  <EditableRow
                    key={key}
                    paramKey={key}
                    aiValue={val as number}
                    overrides={result.manual_overrides}
                    resultId={result.result_id}
                  />
                ))}
              </div>
            </div>
          )}

          {Object.keys(result.flagged_anomalies ?? {}).length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Flagged Anomalies</p>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-1.5">
                {Object.entries(result.flagged_anomalies).map(([key, val]) => (
                  <div key={key} className="flex items-start justify-between gap-4">
                    <span className="text-xs text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="text-xs font-semibold text-slate-800 text-right">
                      {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
