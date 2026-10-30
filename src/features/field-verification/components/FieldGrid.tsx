// Proposal §10.1 FieldGrid: "Thumbnails of all fields with number,
// checked mark, corrected mark and top counts." The running-averages
// part lives in VerificationSummary instead — this component is the
// thumbnail strip/selector only, kept single-purpose.
import { AlertTriangle, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { PARTICLE_LABEL_DISPLAY } from '../../result-review/constants';
import type { FieldSummaryItem } from '../types';

interface Props {
  fields: FieldSummaryItem[];
  selectedFieldId: string | null;
  onSelect: (fieldId: string) => void;
}

function topCounts(field: FieldSummaryItem): string {
  const entries = Object.entries(field.effective_counts).filter(([, v]) => v > 0);
  if (entries.length === 0) return 'No particles seen';
  return entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key, value]) => `${PARTICLE_LABEL_DISPLAY[key] ?? key} ${value}`)
    .join(' · ');
}

function FieldCard({
  field,
  selected,
  onSelect,
}: {
  field: FieldSummaryItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const discarded = field.status === 'DISCARDED';
  const flagged = field.flags.length > 0;
  const checked = !!field.verified_by;

  return (
    <button
      onClick={onSelect}
      disabled={discarded}
      className={`group relative flex w-44 shrink-0 flex-col overflow-hidden rounded-xl border bg-white text-left transition-all ${
        selected
          ? 'border-blue-400 ring-2 ring-blue-100 shadow-md'
          : discarded
            ? 'border-slate-100 opacity-50 cursor-not-allowed'
            : 'border-slate-200 hover:border-blue-300 hover:shadow-sm cursor-pointer'
      }`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
        {field.image_url ? (
          <img
            src={field.image_url}
            alt={`Field ${field.field_no}`}
            className={`h-full w-full object-cover transition-transform ${!discarded && 'group-hover:scale-105'} ${discarded ? 'grayscale' : ''}`}
            draggable={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-slate-500">
            Image unavailable
          </div>
        )}

        {/* Field number chip */}
        <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          #{field.field_no}
        </span>

        {/* Status badge */}
        <span className="absolute right-1.5 top-1.5">
          {discarded ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-700/80 text-white">
              <Trash2 className="h-3 w-3" />
            </span>
          ) : checked ? (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </span>
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-white/80 bg-white/20 backdrop-blur-sm" />
          )}
        </span>

        {/* Corrected / flagged markers, bottom-left */}
        {(field.has_corrections || flagged) && !discarded && (
          <span className="absolute bottom-1.5 left-1.5 flex gap-1">
            {field.has_corrections && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm"
                title="Has corrections"
              >
                <Pencil className="h-2.5 w-2.5" />
              </span>
            )}
            {flagged && (
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
                title="Flagged for review"
              >
                <AlertTriangle className="h-2.5 w-2.5" />
              </span>
            )}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 px-2.5 py-2">
        {discarded ? (
          <span className="truncate text-[11px] text-slate-400 italic">
            {field.discard_reason || 'Discarded'}
          </span>
        ) : (
          <>
            <span className="truncate text-[11px] font-medium text-slate-600">
              {topCounts(field)}
            </span>
            <Badge
              variant={checked ? 'success' : 'default'}
              className="w-fit px-1.5 py-0 text-[10px]"
            >
              {checked ? 'Checked' : 'Needs check'}
            </Badge>
          </>
        )}
      </div>
    </button>
  );
}

export function FieldGrid({ fields, selectedFieldId, onSelect }: Props) {
  if (fields.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-400">
        No fields yet.
      </div>
    );
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
      {fields.map((field) => (
        <FieldCard
          key={field.field_id}
          field={field}
          selected={field.field_id === selectedFieldId}
          onSelect={() => onSelect(field.field_id)}
        />
      ))}
    </div>
  );
}
