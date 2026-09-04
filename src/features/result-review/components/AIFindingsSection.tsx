import { useState } from 'react';
import { Bot, Pencil, Check, X, Loader2 } from 'lucide-react';
import { useSaveOverride } from '../hooks/useResultReview';
import type { FullResultDetail, ManualOverrideItem } from '../types';


interface Props {
  result: FullResultDetail;
}

const PARTICLE_CLASSES: { key: string; label: string }[] = [
  { key: 'erythrocytes',           label: 'Erythrocytes (RBC)' },
  { key: 'leukocytes',             label: 'Leukocytes (WBC)' },
  { key: 'epithelial_cells',       label: 'Epithelial Cells' },
  { key: 'urinary_casts',          label: 'Urinary Casts' },
  { key: 'crystals',               label: 'Crystals' },
  { key: 'mucus_threads',          label: 'Mucus Threads' },
  { key: 'bacteria',               label: 'Bacteria' },
  { key: 'yeast',                  label: 'Yeast' },
  { key: 'sperm_cells',            label: 'Sperm Cells' },
  { key: 'trichomonas_vaginalis',  label: 'Trichomonas vaginalis' },
];

function getEffectiveValue(key: string, overrides: ManualOverrideItem[]): string | null {
  const matches = overrides.filter((o) => o.parameter_name === key);
  if (matches.length === 0) return null;
  const latest = matches.reduce((a, b) => (a.overridden_at > b.overridden_at ? a : b));
  return latest.corrected_value;
}

interface ParticleRowProps {
  particleKey: string;
  label: string;
  aiValue: number | null;
  overrides: ManualOverrideItem[];
  resultId: string;
  isLast: boolean;
}

function ParticleRow({ particleKey, label, aiValue, overrides, resultId, isLast }: ParticleRowProps) {
  const effective = getEffectiveValue(particleKey, overrides);
  const displayValue = effective ?? (aiValue !== null ? String(aiValue) : '—');
  const hasOverride = !!effective;

  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [rationale, setRationale] = useState('');
  const [localSaved, setLocalSaved] = useState(false);
  const [error, setError] = useState('');

  const mutation = useSaveOverride(resultId);

  // The baseline numeric value before any edit
  const baselineNum = effective !== null
    ? parseFloat(effective)
    : aiValue !== null
      ? aiValue
      : 0;

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

  return (
    <div className={`${!isLast ? 'border-b border-slate-100' : ''} ${hasOverride ? 'bg-amber-50' : ''}`}>
      {/* Main row */}
      <div className={`flex items-center gap-3 px-4 py-3 ${editing ? '' : 'group'}`}>
        {/* Label */}
        <div className="flex-1 min-w-0">
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
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                edited
              </span>
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
          {error && (
            <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

function GenericFindingsCard({
  title,
  tone,
  data,
}: {
  title: string;
  tone: 'neutral' | 'warning';
  data: Record<string, unknown>;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const headerClass = tone === 'warning' ? 'border-amber-100 bg-amber-50' : 'border-slate-100 bg-slate-50';
  const titleClass = tone === 'warning' ? 'text-amber-700' : 'text-slate-500';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className={`px-5 py-3.5 border-b ${headerClass}`}>
        <h3 className={`text-xs font-bold uppercase tracking-widest ${titleClass}`}>{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {entries.map(([key, value]) => (
          <div key={key} className="flex items-center justify-between px-5 py-3">
            <span className="text-sm text-slate-500 capitalize">{key.replace(/_/g, ' ')}</span>
            <span className="text-sm font-semibold text-slate-800 font-mono">
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AIFindingsSection({ result }: Props) {
  const counts = result.particle_classes ?? {};
  const overrides = result.manual_overrides ?? [];

  const overriddenKeys = new Set(overrides.map((o) => o.parameter_name));
  const overrideCount = PARTICLE_CLASSES.filter((p) => overriddenKeys.has(p.key)).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-blue-100 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
              <Bot className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest">AI Particle Counts</h3>
              <p className="text-[10px] text-blue-400 uppercase tracking-widest mt-0.5">
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
          <span className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Particle</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-14 text-right">Count</span>
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
                resultId={result.result_id}
                isLast={idx === PARTICLE_CLASSES.length - 1}
              />
            );
          })}
        </div>
      </div>

      <GenericFindingsCard title="Flagged Anomalies" tone="warning" data={result.flagged_anomalies ?? {}} />
      <GenericFindingsCard title="AI Findings" tone="neutral" data={result.ai_findings ?? {}} />
    </div>
  );
}