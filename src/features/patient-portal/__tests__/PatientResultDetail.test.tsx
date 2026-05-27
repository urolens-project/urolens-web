/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PatientResultDetail } from '../components/PatientResultDetail';
import type { PatientResultDetail as DetailType } from '../types';

const ALL_LABELS = [
  'bacteria', 'crystals', 'epithelial-cells', 'erythrocytes',
  'leukocytes', 'mucus-threads', 'sperm-cells',
  'trichomonas-vaginalis', 'urinary-casts', 'yeast',
];

function makeParticleCounts(overrides: Partial<Record<string, number>> = {}) {
  return ALL_LABELS.map(label => ({ label, count: overrides[label] ?? 0 }));
}

function renderDetail(result: DetailType, onDownloadPdf?: () => void) {
  return render(
    <MemoryRouter>
      <PatientResultDetail result={result} onDownloadPdf={onDownloadPdf} />
    </MemoryRouter>
  );
}

const mockResult: DetailType = {
  status: 'RELEASED',
  confirmed_at: '2026-05-16T10:00:00Z',
  released_at: '2026-05-20T10:00:00Z',
  analyzed_by: 'Dr. Santos, RMT',
  particle_counts: makeParticleCounts({ bacteria: 5, leukocytes: 2 }),
  particle_classes: ['bacteria', 'leukocytes'],
  confirmation_notes: 'Normal urinalysis findings.',
  smart_diagnosis_unavailable: false,
  test_type: 'Urinalysis',
};

const mockResultNoAnalyst: DetailType = {
  ...mockResult,
  analyzed_by: null,
  confirmation_notes: null,
};

const mockResultUnavailable: DetailType = {
  ...mockResult,
  smart_diagnosis_unavailable: true,
};

const mockPendingResult: DetailType = {
  status: 'PENDING',
  confirmed_at: null,
  released_at: null,
  analyzed_by: null,
  particle_counts: makeParticleCounts(),
  particle_classes: [],
  confirmation_notes: null,
  smart_diagnosis_unavailable: false,
  test_type: 'Urinalysis',
};

describe('PatientResultDetail', () => {
  it('renders back navigation link', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Back to My Results')).toBeInTheDocument();
  });

  it('renders test type as heading', () => {
    renderDetail(mockResult);
    expect(screen.getByRole('heading', { name: 'Urinalysis' })).toBeInTheDocument();
  });

  it('renders status chip', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Released')).toBeInTheDocument();
  });

  it('renders date of analysis when confirmed_at is set', () => {
    renderDetail(mockResult);
    expect(screen.getByText(/Date of Analysis/)).toBeInTheDocument();
  });

  it('renders date released when released_at is set', () => {
    renderDetail(mockResult);
    expect(screen.getByText(/Date Released/)).toBeInTheDocument();
  });

  it('renders analyzed_by section when non-null', () => {
    renderDetail(mockResult);
    expect(screen.getByLabelText('Analyzed by')).toBeInTheDocument();
    expect(screen.getByText('Dr. Santos, RMT')).toBeInTheDocument();
  });

  it('hides analyzed_by section when null', () => {
    renderDetail(mockResultNoAnalyst);
    expect(screen.queryByLabelText('Analyzed by')).not.toBeInTheDocument();
  });

  it('renders particle counts section with all 10 rows', () => {
    renderDetail(mockResult);
    expect(screen.getByLabelText('Particle counts')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(11); // header + 10
  });

  it('renders laboratory notes when confirmation_notes is non-null', () => {
    renderDetail(mockResult);
    expect(screen.getByLabelText('Laboratory notes')).toBeInTheDocument();
    expect(screen.getByText('Normal urinalysis findings.')).toBeInTheDocument();
  });

  it('hides laboratory notes when confirmation_notes is null', () => {
    renderDetail(mockResultNoAnalyst);
    expect(screen.queryByLabelText('Laboratory notes')).not.toBeInTheDocument();
  });

  it('shows availability notice when smart_diagnosis_unavailable is true', () => {
    renderDetail(mockResultUnavailable);
    expect(
      screen.getByText('Analysis indicators are currently unavailable for this result.')
    ).toBeInTheDocument();
  });

  it('hides availability notice when smart_diagnosis_unavailable is false', () => {
    renderDetail(mockResult);
    expect(
      screen.queryByText('Analysis indicators are currently unavailable for this result.')
    ).not.toBeInTheDocument();
  });

  it('always renders AI disclaimer', () => {
    renderDetail(mockResult);
    expect(
      screen.getByText(/UroLens is a clinical decision-support tool/)
    ).toBeInTheDocument();
  });

  it('also renders AI disclaimer on pending results', () => {
    renderDetail(mockPendingResult);
    expect(
      screen.getByText(/UroLens is a clinical decision-support tool/)
    ).toBeInTheDocument();
  });

  it('shows Download PDF button for RELEASED results', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });

  it('hides Download PDF button for non-RELEASED results', () => {
    renderDetail(mockPendingResult);
    expect(screen.queryByText('Download PDF')).not.toBeInTheDocument();
  });

  it('calls onDownloadPdf when Download PDF is clicked', () => {
    const onDownloadPdf = vi.fn();
    renderDetail(mockResult, onDownloadPdf);
    screen.getByText('Download PDF').click();
    expect(onDownloadPdf).toHaveBeenCalledTimes(1);
  });

  it('does NOT render result_id, specimen_id, or confirmed_by UUID', () => {
    renderDetail(mockResult);
    expect(screen.queryByText(/result_id/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/specimen_id/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/confirmed_by/i)).not.toBeInTheDocument();
  });
});
