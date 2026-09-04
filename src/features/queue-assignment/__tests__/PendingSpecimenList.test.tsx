/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import { PendingSpecimenList } from '../components/PendingSpecimenList';
import type { PendingSpecimenItem } from '../types';

const specimens: PendingSpecimenItem[] = [
  {
    specimen_id: 'spec-1',
    sample_uid: 'SAM-000001',
    patient_uid: 'PAT-000001',
    test_type: 'Urinalysis - Routine',
    status: 'LABELED',
    received_at: '2026-05-20T10:00:00Z',
  },
  {
    specimen_id: 'spec-2',
    sample_uid: 'SAM-000002',
    patient_uid: 'PAT-000002',
    test_type: 'Urinalysis - Complete',
    status: 'LABELED',
    received_at: '2026-05-21T14:30:00Z',
  },
];

describe('PendingSpecimenList', () => {
  it('renders all specimens in the list', () => {
    render(
      <PendingSpecimenList
        specimens={specimens}
        selectedSpecimenId={null}
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    expect(screen.getByText('SAM-000001')).toBeInTheDocument();
    expect(screen.getByText('SAM-000002')).toBeInTheDocument();
  });

  it('highlights the selected specimen', () => {
    render(
      <PendingSpecimenList
        specimens={specimens}
        selectedSpecimenId="spec-1"
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    const specButton = screen.getByText('SAM-000001').closest('button');
    expect(specButton?.className).toContain('bg-emerald-50');
    expect(specButton?.className).toContain('border-emerald-200');
  });

  it('does not highlight unselected specimens', () => {
    render(
      <PendingSpecimenList
        specimens={specimens}
        selectedSpecimenId="spec-1"
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    const specButton = screen.getByText('SAM-000002').closest('button');
    expect(specButton?.className).toContain('bg-slate-50');
    expect(specButton?.className).toContain('border-slate-200');
  });

  it('fires onSelect when a specimen is clicked', () => {
    const handleSelect = vi.fn();

    render(
      <PendingSpecimenList
        specimens={specimens}
        selectedSpecimenId={null}
        onSelect={handleSelect}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByText('SAM-000001'));
    expect(handleSelect).toHaveBeenCalledWith('spec-1');
  });

  it('shows empty state when specimens list is empty', () => {
    render(
      <PendingSpecimenList
        specimens={[]}
        selectedSpecimenId={null}
        onSelect={() => {}}
        isLoading={false}
      />,
    );

    expect(
      screen.getByText('No labeled specimens awaiting assignment.'),
    ).toBeInTheDocument();
  });

  it('shows loading skeletons when isLoading is true', () => {
    const { container } = render(
      <PendingSpecimenList
        specimens={[]}
        selectedSpecimenId={null}
        onSelect={() => {}}
        isLoading={true}
      />,
    );

    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
