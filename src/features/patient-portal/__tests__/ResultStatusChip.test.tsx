/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { ResultStatusChip } from '../components/ResultStatusChip';

describe('ResultStatusChip', () => {
  it('renders correct label and color for RELEASED', () => {
    render(<ResultStatusChip status="RELEASED" />);
    const chip = screen.getByText('Released');
    expect(chip).toBeInTheDocument();
    expect(chip.className).toContain('bg-emerald-50');
    expect(chip.className).toContain('text-emerald-700');
  });

  it('renders correct label and color for PENDING', () => {
    render(<ResultStatusChip status="PENDING" />);
    const chip = screen.getByText('Not yet released');
    expect(chip).toBeInTheDocument();
    expect(chip.className).toContain('bg-slate-100');
    expect(chip.className).toContain('text-slate-600');
  });

  it('falls back to the raw status for anything not RELEASED/PENDING', () => {
    // The patient portal's backend always masks internal workflow stages
    // down to RELEASED/PENDING before this component ever sees them — this
    // just confirms an unexpected value doesn't crash or silently vanish.
    render(<ResultStatusChip status="UNKNOWN" />);
    const chip = screen.getByText('UNKNOWN');
    expect(chip).toBeInTheDocument();
    expect(chip.className).toContain('bg-slate-100');
    expect(chip.className).toContain('text-slate-600');
  });
});
