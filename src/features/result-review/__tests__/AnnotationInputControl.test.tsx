/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnnotationInputControl } from '../components/AnnotationInputControl';
import type { AnnotationItem } from '../types';

function makeAnnotation(overrides: Partial<AnnotationItem> = {}): AnnotationItem {
  return {
    reviewed_by: 'user-1',
    reviewer_role: 'SUPERVISOR',
    annotation_notes: 'Some note',
    spatial_annotations: null,
    updated_at: '2026-09-30T10:00:00Z',
    ...overrides,
  };
}

function renderControl(props: Partial<Parameters<typeof AnnotationInputControl>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AnnotationInputControl
        resultId="r-1"
        myRoleLabel="Supervisor"
        myAnnotation={undefined}
        otherAnnotations={[]}
        {...props}
      />
    </QueryClientProvider>,
  );
}

describe('AnnotationInputControl', () => {
  it('shows the other reviewer annotation read-only, attributed by role', () => {
    renderControl({
      otherAnnotations: [
        makeAnnotation({ reviewer_role: 'MEDTECH', annotation_notes: 'Recount pending' }),
      ],
    });

    expect(screen.getByText('MedTech Annotation')).toBeInTheDocument();
    expect(screen.getByText('Recount pending')).toBeInTheDocument();
    // Read-only: no textarea carries the other reviewer's text.
    expect(screen.queryByDisplayValue('Recount pending')).not.toBeInTheDocument();
  });

  it("pre-fills the editable textarea with the viewer's own annotation only", () => {
    renderControl({
      myAnnotation: makeAnnotation({
        reviewer_role: 'SUPERVISOR',
        annotation_notes: 'My own note',
      }),
      otherAnnotations: [
        makeAnnotation({ reviewer_role: 'MEDTECH', annotation_notes: 'Their note' }),
      ],
    });

    expect(screen.getByDisplayValue('My own note')).toBeInTheDocument();
    expect(screen.getByText('Their note')).toBeInTheDocument();
    expect(screen.getByText('Supervisor Annotation (yours)')).toBeInTheDocument();
  });

  it('does not render a card for an other reviewer with no notes yet', () => {
    renderControl({
      otherAnnotations: [makeAnnotation({ reviewer_role: 'MEDTECH', annotation_notes: null })],
    });

    expect(screen.queryByText('MedTech Annotation')).not.toBeInTheDocument();
  });
});
