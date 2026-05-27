import { useState } from 'react';
import { Bot, Pencil, Check, X } from 'lucide-react';
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
  const match = [...overrides].reverse().find((o) => o.parameter_name === key);
  return match ? match.corrected_value : null;
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
  const [inputVal, setInputVal] = useState(displayValue);
  const [rationale, setRationale] = useState('');
  const [localSaved, setLocalSaved] = useState(false);

  const mutation = useSaveOverride(resultId);

  function startEdit() {
    setInputVal(effective ?? (aiValue !== null ? String(aiValue) : '0'));
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
    await mutation.mutateAsync({ parameter: particleKey, correctedValue: num, rationale: rationale.trim() });
    setLocalSaved(true);
    setEditing(false);
    setTimeout(() => setLocalSaved(false), 2500);
  }

  const isChanged = inputVal !== (effective ?? (aiValue !== null ? String(aiValue) : '0'));

  return (
    <div className={`${!isLast ? 'border-b border-slate-100' : ''} ${hasOverride ? 'bg-amber-50' : ''}`}>
      {/* Main row */}
      <div className={`flex items-center gap-3 px-4 py-3 ${editing ? '' : 'group'}`}>
        {/* Left: label */}
        <div className="flex-1 min-w-0">
          <span className="text-sm text-slate-600 font-medium">{label}</span>
        </div>

        {/* Right: value + actions */}
        {!editing ? (
          <div className="flex items-center gap-2.5 shrink-0">
            {hasOverride && (
              <span className="text-xs text-slate-400 line-through">{aiValue ?? '—'}</span>
            )}
            <span className={`text-base font-bold tabular-nums min-w-8 text-right ${hasOverride ? 'text-amber-700' : 'text-slate-900'}`}>
              {displayValue}
            </span>
            {hasOverride && (
              <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 border border-amber-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                edited
              </span>
            )}
            {localSaved && (
              <span className="text-xs text-emerald-600 font-semibold">Saved!</span>
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
              disabled={!isChanged || !rationale.trim() || mutation.isPending}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Save correction"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={cancel}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 transition-colors"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Inline edit panel — expands below the row */}
      {editing && (
        <div className="px-4 pb-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">AI value:</span>
            <span className="text-xs font-semibold text-slate-500 line-through">{aiValue ?? '—'}</span>
            <span className="text-xs text-slate-400 mx-0.5">→</span>
            <span className="text-xs text-slate-400">New value:</span>
            <input
              type="number"
              min={0}
              step={1}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-24 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-bold text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              autoFocus
            />
          </div>
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Reason for correction (required)…"
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
          {mutation.isError && (
            <p className="text-xs text-red-600 font-medium">Save failed. Please try again.</p>
          )}
        </div>
      )}
    </div>
  );
}

export function AIFindingsSection({ result }: Props) {
  const counts = result.particle_classes ?? {};
  const overrides = result.manual_overrides ?? [];

  const overriddenKeys = new Set(overrides.map((o) => o.parameter_name));
  const overrideCount = PARTICLE_CLASSES.filter((p) => overriddenKeys.has(p.key)).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Particle Counts</h3>
          {overrideCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-amber-100 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {overrideCount} edited
            </span>
          )}
        </div>
        <span className="text-xs text-slate-400 font-mono">v{result.model_version || '—'}</span>
      </div>

      {/* Hint */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
        <p className="text-[11px] text-slate-400">
          Hover a row and click <Pencil className="inline h-2.5 w-2.5 mx-0.5" /> to correct a count. All edits are logged.
        </p>
      </div>

      {/* Particle list */}
      <div>
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
  );
}
