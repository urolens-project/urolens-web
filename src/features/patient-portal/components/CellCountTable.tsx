import type { ParticleCount } from '../types';

const LABEL_DISPLAY: Record<string, string> = {
  'bacteria': 'Bacteria',
  'crystals': 'Crystals',
  'epithelial-cells': 'Epithelial Cells',
  'erythrocytes': 'Erythrocytes (RBC)',
  'leukocytes': 'Leukocytes (WBC)',
  'mucus-threads': 'Mucus Threads',
  'sperm-cells': 'Sperm Cells',
  'trichomonas-vaginalis': 'Trichomonas vaginalis',
  'urinary-casts': 'Urinary Casts',
  'yeast': 'Yeast',
};

interface CellCountTableProps {
  particleCounts: ParticleCount[];
}

export function CellCountTable({ particleCounts }: CellCountTableProps) {
  if (!particleCounts || particleCounts.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-400">
        Cell count data not yet available.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
              Parameter
            </th>
            <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
              Count
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {particleCounts.map((pc) => {
            const isNonZero = pc.count !== 0;
            const display = LABEL_DISPLAY[pc.label] ?? pc.label;

            return (
              <tr key={pc.label}>
                <td className="px-4 py-3 text-slate-700">{display}</td>
                <td className={`px-4 py-3 font-mono ${isNonZero ? 'text-amber-700 font-semibold bg-amber-50/50' : 'text-slate-500'}`}>
                  {pc.count}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
