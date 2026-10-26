// Proposal §10.1 FieldCountsPanel, "built from AIFindingsSection": AI
// count, effective count, override with required reason, per field.
// Validates 0 to 1,000 (schemas/field.py's MAX_FIELD_COUNT), not the
// result-level MAX_OVERRIDE_COUNT=300 AIFindingsSection still uses.
import { useState } from 'react';
import { Bot, Pencil, Check, X, Loader2, Flag, RotateCcw } from 'lucide-react';
import { useOverrideFieldParameter, useRevertFieldOverride } from '../hooks/useFieldVerification';
import { PARTICLE_LABELS, PARTICLE_LABEL_DISPLAY } from '../../result-review/constants';
import type { ApiError } from '../../../types/domain';
import type { FieldDetail, FieldOverride } from '../types';

const MAX_FIELD_COUNT = 1000;

interface Props {
  resultId: string;
  field: FieldDetail;
  readOnly: boolean;
}

function getOverride(key: string, overrides: FieldOverride[]): FieldOverride | undefined {
  return overrides.find((o) => o.particle_type === key);
}

interface RowProps {
  resultId: string;
  fieldId: string;
  particleKey: string;
  label: string;
  aiValue: number | undefined;
  effectiveValue: number | undefined;
  override: FieldOverride | undefined;
  isFlagged: boolean;
  isLast: boolean;
  readOnly: boolean;
}

function ParticleRow({
  resultId,
  fieldId,
  particleKey,
  label,
  aiValue,
  effectiveValue,
  override,
  isFlagged,
  isLast,
  readOnly,
}: RowProps) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [rationale, setRationale] = useState('');
  const [error, setError] = useState('');
  const [localSaved, setLocalSaved] = useState(false);

  const overrideMutation = useOverrideFieldParameter(resultId, fieldId);
  const revertMutation = useRevertFieldOverride(resultId, fieldId);

  const displayValue = effectiveValue ?? aiValue ?? 0;

  function startEdit() {
    setInputVal(String(displayValue));
    setRationale('');
    setError('');
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setError('');
  }

  async function confirm() {
    const num = parseInt(inputVal, 10);
    if (inputVal.trim() === '' || Number.isNaN(num)) {
      setError('Enter a valid whole number.');
      return;
    }
    if (num < 0 || num > MAX_FIELD_COUNT) {
      setError(`Value must be between 0 and ${MAX_FIELD_COUNT}.`);
      return;
    }
    if (!rationale.trim()) {
      setError('Please enter a reason for the correction.');
      return;
    }
    if (num === displayValue) {
      setError('Value is the same as current. Change the value or cancel.');
      return;
    }
    setError('');
    try {
      await overrideMutation.mutateAsync({
        particle_type: particleKey,
        corrected_value: num,
        rationale: rationale.trim(),
      });
      setLocalSaved(true);
      setEditing(false);
      setTimeout(() => setLocalSaved(false), 2500);
    } catch (err) {
      setError((err as ApiError).message ?? 'Failed to save the correction.');
    }
  }

  async function revert() {
    const reason = window.prompt('Reason for reverting to the AI/box-derived value?');
    if (!reason?.trim()) return;
    try {
      await revertMutation.mutateAsync({ particle_type: particleKey, rationale: reason.trim() });
    } catch {
      // Mutation error state isn't surfaced inline here — a failed revert
      // leaves the override in place, which is itself visible feedback.
    }
  }

  return (
    <div className={!isLast ? 'border-b border-slate-100' : ''}>
      <div className={`flex items-center gap-3 px-4 py-3 ${editing ? '' : 'group'}`}>
        <div className="flex-1 min-w-0 flex items-center gap-1.5">
          {isFlagged && <Flag className="h-3 w-3 text-red-500 shrink-0" aria-label="Flagged" />}
          <span className="text-sm text-slate-600 font-medium">{label}</span>
        </div>

        {!editing ? (
          <div className="flex items-center gap-2.5 shrink-0">
            {override && (
              <span className="text-xs text-slate-400 line-through">{aiValue ?? '—'}</span>
            )}
            <span
              className={`text-base font-bold tabular-nums min-w-8 text-right ${
                override ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {displayValue}
            </span>
            {localSaved && <span className="text-xs text-emerald-600 font-semibold">Saved!</span>}
            {!readOnly && override && (
              <button
                onClick={revert}
                disabled={revertMutation.isPending}
                className="rounded-lg p-1.5 text-slate-300 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                title="Revert to AI/box-derived value"
              >
                {revertMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="h-3.5 w-3.5" />
                )}
              </button>
            )}
            {!readOnly && (
              <button
                onClick={startEdit}
                className="rounded-lg p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-all"
                title="Correct this value"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={confirm}
              disabled={overrideMutation.isPending}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
            >
              {overrideMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={cancel}
              disabled={overrideMutation.isPending}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="px-5 pb-4 pt-1 bg-slate-50/80 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <input
              type="number"
              min={0}
              max={MAX_FIELD_COUNT}
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setError('');
              }}
              autoFocus
              className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <textarea
            value={rationale}
            onChange={(e) => {
              setRationale(e.target.value);
              setError('');
            }}
            placeholder="Enter reason for correction…"
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
        </div>
      )}
    </div>
  );
}

export function FieldCountsPanel({ resultId, field, readOnly }: Props) {
  const flaggedKeys = new Set(field.flags.map((f) => f.particle_type).filter(Boolean) as string[]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-blue-100 bg-blue-50">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
            <Bot className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest">
              Field {field.field_no} Counts
            </h3>
            <p className="text-[10px] text-blue-400 uppercase tracking-widest mt-0.5">
              {readOnly ? 'Read-only' : 'Hover any row to correct'}
            </p>
          </div>
        </div>
        {field.overridden_classes.length > 0 && (
          <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
            {field.overridden_classes.length} Correction
            {field.overridden_classes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 border-b border-slate-100">
        <span className="flex-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Particle
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-14 text-right">
          Count
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {PARTICLE_LABELS.map((key, idx) => (
          <ParticleRow
            key={key}
            resultId={resultId}
            fieldId={field.field_id}
            particleKey={key}
            label={PARTICLE_LABEL_DISPLAY[key]}
            aiValue={field.ai_findings[key]}
            effectiveValue={field.effective_counts[key]}
            override={getOverride(key, field.overrides)}
            isFlagged={flaggedKeys.has(key)}
            isLast={idx === PARTICLE_LABELS.length - 1}
            readOnly={readOnly}
          />
        ))}
      </div>
    </div>
  );
}
