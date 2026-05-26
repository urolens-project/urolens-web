import type { ProbabilityLevel } from '../types';

const CONFIG: Record<ProbabilityLevel, { label: string; className: string; barColor: string; barWidth: string }> = {
  LOW:      { label: 'LOW',      className: 'bg-emerald-100 text-emerald-700 border-emerald-200', barColor: 'bg-emerald-500', barWidth: 'w-1/4' },
  MODERATE: { label: 'MODERATE', className: 'bg-amber-100 text-amber-700 border-amber-200',       barColor: 'bg-amber-500',   barWidth: 'w-1/2' },
  HIGH:     { label: 'HIGH',     className: 'bg-red-100 text-red-700 border-red-200',             barColor: 'bg-red-500',     barWidth: 'w-full' },
};

interface Props {
  level: ProbabilityLevel;
  showBar?: boolean;
}

export function ProbabilityBadge({ level, showBar = false }: Props) {
  const { label, className, barColor, barWidth } = CONFIG[level];
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase ${className}`}>
        {label} PROBABILITY
      </span>
      {showBar && (
        <div className="h-1.5 w-full rounded-full bg-slate-100">
          <div className={`h-1.5 rounded-full transition-all ${barColor} ${barWidth}`} />
        </div>
      )}
    </div>
  );
}
