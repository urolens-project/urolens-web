/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import { MedTechWorkloadPanel } from '../components/MedTechWorkloadPanel';
import type { MedTechWorkloadItem } from '../types';

const workloads: MedTechWorkloadItem[] = [
  { user_id: 'mt-1', full_name: 'Alice Med', active_count: 2 },
  { user_id: 'mt-2', full_name: 'Bob Tech', active_count: 5 },
  { user_id: 'mt-3', full_name: 'Carol Lab', active_count: 0 },
];

describe('MedTechWorkloadPanel', () => {
  it('renders all workloads in the list', () => {
    render(
      <MedTechWorkloadPanel
        workloads={workloads}
        selectedMedTechId={null}
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText('Alice Med')).toBeInTheDocument();
    expect(screen.getByText('Bob Tech')).toBeInTheDocument();
    expect(screen.getByText('Carol Lab')).toBeInTheDocument();
  });

  it('shows active count badge for each MedTech', () => {
    render(
      <MedTechWorkloadPanel
        workloads={workloads}
        selectedMedTechId={null}
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText('2 active')).toBeInTheDocument();
    expect(screen.getByText('5 active')).toBeInTheDocument();
    expect(screen.getByText('0 active')).toBeInTheDocument();
  });

  it('applies success badge color for count 0-3', () => {
    render(
      <MedTechWorkloadPanel
        workloads={[{ user_id: 'mt-1', full_name: 'Alice Med', active_count: 2 }]}
        selectedMedTechId={null}
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    const badge = screen.getByText('2 active');
    expect(badge.className).toContain('bg-emerald-100');
    expect(badge.className).toContain('text-emerald-700');
  });

  it('applies warning badge color for count 4-6', () => {
    render(
      <MedTechWorkloadPanel
        workloads={[{ user_id: 'mt-2', full_name: 'Bob Tech', active_count: 5 }]}
        selectedMedTechId={null}
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    const badge = screen.getByText('5 active');
    expect(badge.className).toContain('bg-amber-100');
    expect(badge.className).toContain('text-amber-700');
  });

  it('applies danger badge color for count 7+', () => {
    render(
      <MedTechWorkloadPanel
        workloads={[{ user_id: 'mt-3', full_name: 'Carol Lab', active_count: 8 }]}
        selectedMedTechId={null}
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    const badge = screen.getByText('8 active');
    expect(badge.className).toContain('bg-rose-100');
    expect(badge.className).toContain('text-rose-700');
  });

  it('highlights the selected MedTech', () => {
    render(
      <MedTechWorkloadPanel
        workloads={workloads}
        selectedMedTechId="mt-2"
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    const bobButton = screen.getByText('Bob Tech').closest('button');
    expect(bobButton?.className).toContain('bg-emerald-50');
    expect(bobButton?.className).toContain('border-emerald-200');
  });

  it('does not highlight unselected MedTechs', () => {
    render(
      <MedTechWorkloadPanel
        workloads={workloads}
        selectedMedTechId="mt-2"
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    const aliceButton = screen.getByText('Alice Med').closest('button');
    expect(aliceButton?.className).toContain('bg-slate-50');
    expect(aliceButton?.className).toContain('border-slate-200');
  });

  it('fires onSelect with user_id when a MedTech is clicked', () => {
    const handleSelect = vi.fn();

    render(
      <MedTechWorkloadPanel
        workloads={workloads}
        selectedMedTechId={null}
        onSelect={handleSelect}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByText('Bob Tech'));
    expect(handleSelect).toHaveBeenCalledWith('mt-2');
  });

  it('shows empty state when workloads list is empty', () => {
    render(
      <MedTechWorkloadPanel
        workloads={[]}
        selectedMedTechId={null}
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    expect(
      screen.getByText('No active Medical Technologists available.'),
    ).toBeInTheDocument();
  });

  it('shows loading skeletons when isLoading is true', () => {
    const { container } = render(
      <MedTechWorkloadPanel
        workloads={[]}
        selectedMedTechId={null}
        onSelect={() => {}}
        isLoading={true}
      />,
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
