/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { CellCountTable } from '../components/CellCountTable';
import type { CellCounts } from '../types';

const fullCellCounts: CellCounts = {
  rbc: 5,
  wbc: 2,
  epithelial_cells: 0,
  casts: 1,
  bacteria: 0,
  crystals: 3,
  mucus_threads: 0,
};

const allZeroCellCounts: CellCounts = {
  rbc: 0,
  wbc: 0,
  epithelial_cells: 0,
  casts: 0,
  bacteria: 0,
  crystals: 0,
  mucus_threads: 0,
};

describe('CellCountTable', () => {
  it('renders all 7 parameters', () => {
    render(<CellCountTable cellCounts={fullCellCounts} />);
    expect(screen.getByText('Red Blood Cells (RBC)')).toBeInTheDocument();
    expect(screen.getByText('White Blood Cells (WBC)')).toBeInTheDocument();
    expect(screen.getByText('Epithelial Cells')).toBeInTheDocument();
    expect(screen.getByText('Casts')).toBeInTheDocument();
    expect(screen.getByText('Bacteria')).toBeInTheDocument();
    expect(screen.getByText('Crystals')).toBeInTheDocument();
    expect(screen.getByText('Mucus Threads')).toBeInTheDocument();
  });

  it('highlights non-zero values', () => {
    render(<CellCountTable cellCounts={fullCellCounts} />);
    const nonZeroCells = screen.getAllByText(/^(5|2|1|3)$/);
    for (const cell of nonZeroCells) {
      expect(cell.className).toContain('text-amber-700');
    }
  });

  it('does not highlight zero values', () => {
    render(<CellCountTable cellCounts={fullCellCounts} />);
    const zeroCells = screen.getAllByText('0');
    for (const cell of zeroCells) {
      expect(cell.className).toContain('text-slate-500');
    }
  });

  it('shows empty state when cellCounts is null', () => {
    render(<CellCountTable cellCounts={null} />);
    expect(screen.getByText('Cell count data not yet available.')).toBeInTheDocument();
  });

  it('renders all zero values without amber highlight', () => {
    render(<CellCountTable cellCounts={allZeroCellCounts} />);
    const zeroCells = screen.getAllByText('0');
    expect(zeroCells).toHaveLength(7);
    for (const cell of zeroCells) {
      expect(cell.className).toContain('text-slate-500');
    }
  });
});
