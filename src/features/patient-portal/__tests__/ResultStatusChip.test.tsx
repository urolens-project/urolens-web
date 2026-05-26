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

  it('renders correct label and color for APPROVED', () => {
    render(<ResultStatusChip status="APPROVED" />);
    const chip = screen.getByText('Approved');
    expect(chip).toBeInTheDocument();
    expect(chip.className).toContain('bg-blue-50');
    expect(chip.className).toContain('text-blue-700');
  });

  it('renders correct label and color for PENDING_SUPERVISOR_APPROVAL', () => {
    render(<ResultStatusChip status="PENDING_SUPERVISOR_APPROVAL" />);
    const chip = screen.getByText('Under Review');
    expect(chip).toBeInTheDocument();
    expect(chip.className).toContain('bg-amber-50');
    expect(chip.className).toContain('text-amber-700');
  });

  it('renders correct label and color for CONFIRMED', () => {
    render(<ResultStatusChip status="CONFIRMED" />);
    const chip = screen.getByText('Processing');
    expect(chip).toBeInTheDocument();
    expect(chip.className).toContain('bg-amber-50');
    expect(chip.className).toContain('text-amber-700');
  });

  it('renders correct label and color for PENDING', () => {
    render(<ResultStatusChip status="PENDING" />);
    const chip = screen.getByText('Pending');
    expect(chip).toBeInTheDocument();
    expect(chip.className).toContain('bg-slate-100');
    expect(chip.className).toContain('text-slate-600');
  });

  it('renders fallback for unknown status', () => {
    render(<ResultStatusChip status="UNKNOWN" />);
    const chip = screen.getByText('UNKNOWN');
    expect(chip).toBeInTheDocument();
    expect(chip.className).toContain('bg-slate-100');
    expect(chip.className).toContain('text-slate-600');
  });
});
