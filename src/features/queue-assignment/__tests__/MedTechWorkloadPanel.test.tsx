/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import { MedTechWorkloadPanel } from '../components/MedTechWorkloadPanel';
import type { MedTechWorkload } from '../types';

const workloads: MedTechWorkload[] = [
  { medtech_id: 'mt-1', username: 'Alice Med', queue_count: 2 },
  { medtech_id: 'mt-2', username: 'Bob Tech', queue_count: 5 },
  { medtech_id: 'mt-3', username: 'Carol Lab', queue_count: 0 },
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

  it('shows queue count for each MedTech', () => {
    render(
      <MedTechWorkloadPanel
        workloads={workloads}
        selectedMedTechId={null}
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText('2 in queue')).toBeInTheDocument();
    expect(screen.getByText('5 in queue')).toBeInTheDocument();
    expect(screen.getByText('0 in queue')).toBeInTheDocument();
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

  it('fires onSelect when a MedTech is clicked', () => {
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
