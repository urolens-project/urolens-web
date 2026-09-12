import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import type { EvidenceEntry } from '../types';

const COLLAPSED_LIMIT = 3;

interface Props {
  evidence: EvidenceEntry[];
}

export function EvidenceAttributionList({ evidence }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (evidence.length === 0) {
    return <p className="text-xs text-slate-400 italic">No specific indicators recorded.</p>;
  }

  const visible = expanded ? evidence : evidence.slice(0, COLLAPSED_LIMIT);
  const hasMore = evidence.length > COLLAPSED_LIMIT;

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Evidence Attribution
      </p>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((item) => (
          <Badge key={item.particle_name} variant="default">
            {item.particle_display_name}
          </Badge>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3 w-3" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3 w-3" /> +{evidence.length - COLLAPSED_LIMIT} more
            </>
          )}
        </button>
      )}
    </div>
  );
}
