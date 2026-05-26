import type { ConditionResult } from '../types';
import { ProbabilityBadge } from './ProbabilityBadge';
import { EvidenceAttributionList } from './EvidenceAttributionList';

interface Props {
  condition: ConditionResult;
}

export function ConditionCard({ condition }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-black text-slate-900">{condition.label}</h4>
        <ProbabilityBadge level={condition.score} />
      </div>
      <ProbabilityBadge level={condition.score} showBar />
      <EvidenceAttributionList evidence={condition.evidence} />
    </div>
  );
}
