import { formatParticleLabel } from '../utils';
import type { ParticleCount } from '../types';

interface CellCountTableProps {
  cellCounts: ParticleCount[];
}

export function CellCountTable({ cellCounts }: CellCountTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
              Particle
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
              Count
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {cellCounts.map((item) => {
            // display_value handles "<1" for a rare-but-real finding
            // (proposal §3.3) — a raw count of 0 is the only case where
            // falling back to item.count is still correct either way.
            const isNonZero = item.display_value ? item.display_value !== '0' : item.count > 0;
            return (
              <tr key={item.label}>
                <td className="px-4 py-3 text-slate-700">{formatParticleLabel(item.label)}</td>
                <td
                  className={`px-4 py-3 font-mono ${
                    isNonZero ? 'text-amber-700 font-semibold bg-amber-50/50' : 'text-slate-400'
                  }`}
                >
                  {item.display_value ?? item.count}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
