import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { EvidenceEntry } from '../types';

const COLLAPSED_LIMIT = 3;

interface Props {
  evidence: EvidenceEntry[];
}

export function EvidenceAttributionList({ evidence }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (evidence.length === 0) {
    return (
      <p className="text-[11px] text-slate-400 italic">No specific indicators recorded.</p>
    );
  }

  const visible = expanded ? evidence : evidence.slice(0, COLLAPSED_LIMIT);
  const hasMore = evidence.length > COLLAPSED_LIMIT;

  return (
    <div className="space-y-1.5">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
        Evidence Attribution
      </p>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((item) => (
          <span
            key={item.particle_name}
            className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
          >
            {item.particle_display_name}
          </span>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3" /> Show less</>
          ) : (
            <><ChevronDown className="h-3 w-3" /> +{evidence.length - COLLAPSED_LIMIT} more</>
          )}
        </button>
      )}
    </div>
  );
}
