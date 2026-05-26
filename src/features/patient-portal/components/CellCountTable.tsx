import type { CellCounts } from '../types';

interface CellCountTableProps {
  cellCounts: CellCounts | null;
}

const parameters: { key: keyof CellCounts; label: string }[] = [
  { key: 'rbc', label: 'Red Blood Cells (RBC)' },
  { key: 'wbc', label: 'White Blood Cells (WBC)' },
  { key: 'epithelial_cells', label: 'Epithelial Cells' },
  { key: 'casts', label: 'Casts' },
  { key: 'bacteria', label: 'Bacteria' },
  { key: 'crystals', label: 'Crystals' },
  { key: 'mucus_threads', label: 'Mucus Threads' },
];

export function CellCountTable({ cellCounts }: CellCountTableProps) {
  if (!cellCounts) {
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
          {parameters.map((param) => {
            const value = cellCounts[param.key];
            const isNonZero = value !== 0;

            return (
              <tr key={param.key}>
                <td className="px-4 py-3 text-slate-700">{param.label}</td>
                <td className={`px-4 py-3 font-mono ${isNonZero ? 'text-amber-700 font-semibold bg-amber-50/50' : 'text-slate-500'}`}>
                  {value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
