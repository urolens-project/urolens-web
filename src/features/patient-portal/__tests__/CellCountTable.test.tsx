/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { CellCountTable } from '../components/CellCountTable';
import type { ParticleCount } from '../types';

const ALL_LABELS = [
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

function makeParticleCounts(overrides: Partial<Record<string, number>> = {}): ParticleCount[] {
  return ALL_LABELS.map(label => ({ label, count: overrides[label] ?? 0 }));
}

describe('CellCountTable', () => {
  it('always renders all 10 particle rows', () => {
    render(<CellCountTable cellCounts={makeParticleCounts()} />);
    expect(screen.getAllByRole('row')).toHaveLength(11); // header + 10 data rows
  });

  it('formats hyphenated labels for display', () => {
    render(<CellCountTable cellCounts={makeParticleCounts()} />);
    expect(screen.getByText('Epithelial cells')).toBeInTheDocument();
    expect(screen.getByText('Trichomonas vaginalis')).toBeInTheDocument();
    expect(screen.getByText('Urinary casts')).toBeInTheDocument();
  });

  it('renders non-zero counts with amber highlight', () => {
    render(<CellCountTable cellCounts={makeParticleCounts({ bacteria: 5, leukocytes: 12 })} />);
    const nonZeroCells = screen.getAllByText(/^(5|12)$/);
    for (const cell of nonZeroCells) {
      expect(cell.className).toContain('text-amber-700');
    }
  });

  it('renders zero counts with muted style', () => {
    render(<CellCountTable cellCounts={makeParticleCounts({ bacteria: 3 })} />);
    const zeroCells = screen.getAllByText('0');
    // 9 rows have count 0
    expect(zeroCells).toHaveLength(9);
    for (const cell of zeroCells) {
      expect(cell.className).toContain('text-slate-400');
    }
  });

  it('never filters out zero-count rows', () => {
    render(<CellCountTable cellCounts={makeParticleCounts()} />);
    const zeroCells = screen.getAllByText('0');
    expect(zeroCells).toHaveLength(10);
  });

  it('renders all zero counts without amber highlight when all are 0', () => {
    render(<CellCountTable cellCounts={makeParticleCounts()} />);
    const zeroCells = screen.getAllByText('0');
    for (const cell of zeroCells) {
      expect(cell.className).not.toContain('text-amber-700');
      expect(cell.className).toContain('text-slate-400');
    }
  });
});
