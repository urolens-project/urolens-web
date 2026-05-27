/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { CellCountTable } from '../components/CellCountTable';
import type { ParticleCount } from '../types';

const LABELS = [
  'bacteria',
  'crystals',
  'epithelial-cells',
  'erythrocytes',
  'leukocytes',
  'mucus-threads',
  'sperm-cells',
  'trichomonas-vaginalis',
  'urinary-casts',
  'yeast',
];

function makeCounts(overrides: Record<string, number> = {}): ParticleCount[] {
  return LABELS.map((label) => ({ label, count: overrides[label] ?? 0 }));
}

const allZeroCounts = makeCounts();
const mixedCounts = makeCounts({ bacteria: 5, erythrocytes: 2, 'urinary-casts': 1, crystals: 3 });

describe('CellCountTable', () => {
  it('renders all 10 canonical particle labels', () => {
    render(<CellCountTable particleCounts={mixedCounts} />);
    expect(screen.getByText('Bacteria')).toBeInTheDocument();
    expect(screen.getByText('Crystals')).toBeInTheDocument();
    expect(screen.getByText('Epithelial Cells')).toBeInTheDocument();
    expect(screen.getByText('Erythrocytes (RBC)')).toBeInTheDocument();
    expect(screen.getByText('Leukocytes (WBC)')).toBeInTheDocument();
    expect(screen.getByText('Mucus Threads')).toBeInTheDocument();
    expect(screen.getByText('Sperm Cells')).toBeInTheDocument();
    expect(screen.getByText('Trichomonas vaginalis')).toBeInTheDocument();
    expect(screen.getByText('Urinary Casts')).toBeInTheDocument();
    expect(screen.getByText('Yeast')).toBeInTheDocument();
  });

  it('highlights non-zero counts in amber', () => {
    render(<CellCountTable particleCounts={mixedCounts} />);
    const nonZeroCells = screen.getAllByText(/^(5|2|1|3)$/);
    for (const cell of nonZeroCells) {
      expect(cell.className).toContain('text-amber-700');
    }
  });

  it('does not highlight zero counts', () => {
    render(<CellCountTable particleCounts={mixedCounts} />);
    const zeroCells = screen.getAllByText('0');
    for (const cell of zeroCells) {
      expect(cell.className).toContain('text-slate-500');
    }
  });

  it('shows empty state when particleCounts is empty array', () => {
    render(<CellCountTable particleCounts={[]} />);
    expect(screen.getByText('Cell count data not yet available.')).toBeInTheDocument();
  });

  it('renders all zero values without amber highlight', () => {
    render(<CellCountTable particleCounts={allZeroCounts} />);
    const zeroCells = screen.getAllByText('0');
    expect(zeroCells).toHaveLength(10);
    for (const cell of zeroCells) {
      expect(cell.className).toContain('text-slate-500');
    }
  });
});
