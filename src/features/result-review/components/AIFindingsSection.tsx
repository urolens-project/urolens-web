import { useState } from 'react';
import { Bot, Pencil, Check, X, Loader2, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { useSaveOverride } from '../hooks/useResultReview';
import { PARTICLE_LABELS, PARTICLE_LABEL_DISPLAY } from '../constants';
import type { FullResultDetail, ManualOverrideItem } from '../types';

interface Props {
  result: FullResultDetail;
}

const PARTICLE_CLASSES: { key: string; label: string }[] = PARTICLE_LABELS.map((key) => ({
  key,
  label: PARTICLE_LABEL_DISPLAY[key],
}));

function getLatestOverride(
  key: string,
  overrides: ManualOverrideItem[],
): ManualOverrideItem | null {
  const matches = overrides.filter((o) => o.parameter_name === key);
  if (matches.length === 0) return null;
  return matches.reduce((a, b) => (a.overridden_at > b.overridden_at ? a : b));
}

interface ParticleRowProps {
  particleKey: string;
  label: string;
  aiValue: number | null;
  overrides: ManualOverrideItem[];
  isFlagged: boolean;
  resultId: string;
  isLast: boolean;
}

function ParticleRow({
  particleKey,
  label,
  aiValue,
  overrides,
  isFlagged,
  resultId,
  isLast,
}: ParticleRowProps) {
  const latestOverride = getLatestOverride(particleKey, overrides);
  const displayValue =
    latestOverride?.corrected_value ?? (aiValue !== null ? String(aiValue) : '—');
  const hasOverride = !!latestOverride;

  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [rationale, setRationale] = useState('');
  const [localSaved, setLocalSaved] = useState(false);
  const [error, setError] = useState('');

  const mutation = useSaveOverride(resultId);

  // The baseline numeric value before any edit
  const baselineNum = latestOverride ? parseFloat(latestOverride.corrected_value) : (aiValue ?? 0);

  function startEdit() {
    setInputVal(String(baselineNum));
    setRationale('');
    setEditing(true);
    setLocalSaved(false);
    setError('');
  }

  function cancel() {
    setEditing(false);
    setError('');
  }

  async function confirm() {
    const num = parseFloat(inputVal);

    // Validation
    if (inputVal.trim() === '' || isNaN(num)) {
      setError('Enter a valid number.');
      return;
    }
    if (num < 0) {
      setError('Value cannot be negative.');
      return;
    }
    if (!rationale.trim()) {
      setError('Please enter a reason for the correction.');
      return;
    }
    // Warn if unchanged (but don't block — user may want to re-confirm)
    if (num === baselineNum) {
      setError('Value is the same as current. Change the value or cancel.');
      return;
    }

    setError('');

    try {
      await mutation.mutateAsync({
        parameter: particleKey,
        corrected_value: num,
        rationale: rationale.trim(),
        original_ai_value: aiValue ?? 0,
      });
      setLocalSaved(true);
      setEditing(false);
      setTimeout(() => setLocalSaved(false), 2500);
    } catch {
      setError('Failed to save. Please try again.');
    }
  }

  const parsedInput = parseFloat(inputVal);
  const isValid =
    inputVal.trim() !== '' &&
    !isNaN(parsedInput) &&
    parsedInput >= 0 &&
    parsedInput !== baselineNum &&
    rationale.trim().length > 0;

  const history = overrides
    .filter((o) => o.parameter_name === particleKey)
    .slice()
    .sort((a, b) => (a.overridden_at > b.overridden_at ? -1 : 1));

  return (
    <div
      className={`${!isLast ? 'border-b border-slate-100' : ''} ${hasOverride ? 'bg-amber-50' : ''}`}
    >
      {/* Main row */}
      <div className={`flex items-center gap-3 px-4 py-3 ${editing ? '' : 'group'}`}>
        {/* Label */}
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          {isFlagged && (
            <Flag
              className="h-3 w-3 text-red-500 shrink-0"
              aria-label="Flagged: exceeds clinical threshold"
            />
          )}
          <span className="text-sm text-slate-600 font-medium">{label}</span>
        </div>

        {/* Value + actions */}
        {!editing ? (
          <div className="flex items-center gap-2.5 shrink-0">
            {hasOverride && (
              <span className="text-xs text-slate-400 line-through">{aiValue ?? '—'}</span>
            )}
            <span
              className={`text-base font-bold tabular-nums min-w-8 text-right ${
                hasOverride ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {displayValue}
            </span>
            {hasOverride && (
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="flex items-center gap-0.5 text-[10px] font-semibold text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap hover:bg-amber-200 transition-colors cursor-pointer"
                title={showHistory ? 'Hide correction history' : 'Show correction history'}
              >
                edited
                {showHistory ? (
                  <ChevronUp className="h-2.5 w-2.5" />
                ) : (
                  <ChevronDown className="h-2.5 w-2.5" />
                )}
              </button>
            )}
            {localSaved && (
              <span className="text-xs text-emerald-600 font-semibold animate-in fade-in duration-200">
                Saved!
              </span>
            )}
            <button
              onClick={startEdit}
              className="rounded-lg p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
              title="Correct this value"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={confirm}
              disabled={!isValid || mutation.isPending}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Save correction"
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={cancel}
              disabled={mutation.isPending}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Inline edit panel */}
      {editing && (
        <div className="px-5 pb-4 pt-1 bg-slate-50/80 border-t border-slate-100 animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">Current:</span>
              <span className="font-semibold text-slate-600">{baselineNum}</span>
              <span className="text-slate-400">→</span>
            </div>
            <input
              type="number"
              min={0}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setError('');
              }}
              autoFocus
              className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
            />
          </div>
          <textarea
            value={rationale}
            onChange={(e) => {
              setRationale(e.target.value);
              setError('');
            }}
            placeholder="Enter reason for correction..."
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
        </div>
      )}

      {/* Correction history — rationale + timestamp for every override of
          this particle, newest first. Replaces a standalone "Manual
          Overrides" card: the audit detail only matters when a reviewer
          asks "why was this changed", not every time the page loads. */}
      {showHistory && !editing && (
        <div className="px-5 pb-4 pt-1 bg-amber-50/60 border-t border-amber-100 space-y-2 animate-in slide-in-from-top-1 duration-200">
          {history.map((o) => (
            <div key={o.override_id} className="rounded-lg border border-amber-100 bg-white p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono">
                  <span className="text-slate-400 line-through">{o.original_ai_value}</span>
                  <span className="text-slate-400"> → </span>
                  <span className="font-bold text-amber-700">{o.corrected_value}</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(o.overridden_at).toLocaleString('en-PH', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                <span className="font-medium text-amber-700">Rationale: </span>
                {o.rationale}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AIFindingsSection({ result }: Props) {
  // The AI-detected baseline for the "was" value and for the override
  // request's original_ai_value must come from ai_findings, not
  // particle_classes — the latter already has overrides folded in (settled
  // at confirm time, and kept in sync on every subsequent override), so a
  // second correction would otherwise show the *previous* correction as if
  // it were the original AI detection.
  const counts = result.ai_findings ?? {};
  const overrides = result.manual_overrides ?? [];
  // flagged_anomalies is a filtered view of the same particle list above
  // (currently: non-zero counts; see ai_integration_service.py) — surfaced
  // as a flag icon on the relevant row instead of a second, near-duplicate
  // list underneath.
  const flaggedKeys = new Set(Object.keys(result.flagged_anomalies ?? {}));

  const overriddenKeys = new Set(overrides.map((o) => o.parameter_name));
  const overrideCount = PARTICLE_CLASSES.filter((p) => overriddenKeys.has(p.key)).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-emerald-100 bg-emerald-50">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
              <Bot className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                AI Particle Counts
              </h3>
              <p className="text-[10px] text-emerald-400 uppercase tracking-widest mt-0.5">
                Hover any row to correct
              </p>
            </div>
            {overrideCount > 0 && (
              <span className="ml-1 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                {overrideCount} Manual Edit{overrideCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100">
          <span className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Particle
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-14 text-right">
            Count
          </span>
          <span className="w-6" />
        </div>

        {/* Particle list */}
        <div className="divide-y divide-slate-100">
          {PARTICLE_CLASSES.map(({ key, label }, idx) => {
            const raw = counts[key];
            const aiValue = typeof raw === 'number' ? raw : null;
            return (
              <ParticleRow
                key={key}
                particleKey={key}
                label={label}
                aiValue={aiValue}
                overrides={overrides}
                isFlagged={flaggedKeys.has(key)}
                resultId={result.result_id}
                isLast={idx === PARTICLE_CLASSES.length - 1}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
