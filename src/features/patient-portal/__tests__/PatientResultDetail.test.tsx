/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PatientResultDetail } from '../components/PatientResultDetail';
import type { PatientResultDetail as DetailType, ParticleCount } from '../types';

const LABELS = [
  'bacteria', 'crystals', 'epithelial-cells', 'erythrocytes', 'leukocytes',
  'mucus-threads', 'sperm-cells', 'trichomonas-vaginalis', 'urinary-casts', 'yeast',
];

function makeParticleCounts(overrides: Record<string, number> = {}): ParticleCount[] {
  return LABELS.map((label) => ({ label, count: overrides[label] ?? 0 }));
}

function renderDetail(result: DetailType, onDownloadPdf?: () => void) {
  return render(
    <MemoryRouter>
      <PatientResultDetail result={result} onDownloadPdf={onDownloadPdf} />
    </MemoryRouter>
  );
}

const mockResult: DetailType = {
  result_id: 'abc12345-6789',
  specimen_id: 'spec-001',
  status: 'RELEASED',
  particle_counts: makeParticleCounts({ bacteria: 5, erythrocytes: 2 }),
  analyzed_by: 'Juan dela Cruz, RMT',
  confirmation_notes: 'Normal urinalysis findings.',
  smart_diagnosis_unavailable: false,
  confirmed_at: '2026-05-16T10:00:00Z',
  released_at: '2026-05-20T10:00:00Z',
  created_at: '2026-05-15T08:00:00Z',
};

const mockPendingResult: DetailType = {
  result_id: 'def67890-1234',
  specimen_id: 'spec-002',
  status: 'PENDING',
  particle_counts: makeParticleCounts(),
  analyzed_by: null,
  confirmation_notes: null,
  smart_diagnosis_unavailable: false,
  confirmed_at: null,
  released_at: null,
  created_at: '2026-05-16T09:00:00Z',
};

const mockSmartDiagUnavailable: DetailType = {
  ...mockResult,
  smart_diagnosis_unavailable: true,
};

describe('PatientResultDetail', () => {
  it('renders all four main sections', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Urinalysis Particle Count Findings')).toBeInTheDocument();
    expect(screen.getByText('Laboratory Notes')).toBeInTheDocument();
    expect(screen.getByText('Analyzed By')).toBeInTheDocument();
    expect(screen.getByText('Back to My Results')).toBeInTheDocument();
  });

  it('renders result ID and status chip', () => {
    renderDetail(mockResult);
    expect(screen.getByRole('heading', { name: /abc12345/ })).toBeInTheDocument();
    expect(screen.getByText('Released')).toBeInTheDocument();
  });

  it('renders all 10 particle count rows', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Bacteria')).toBeInTheDocument();
    expect(screen.getByText('Erythrocytes (RBC)')).toBeInTheDocument();
    expect(screen.getByText('Trichomonas vaginalis')).toBeInTheDocument();
    expect(screen.getByText('Yeast')).toBeInTheDocument();
  });

  it('shows confirmation notes when available', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Normal urinalysis findings.')).toBeInTheDocument();
  });

  it('shows empty notes message when confirmation_notes is null', () => {
    renderDetail(mockPendingResult);
    expect(screen.getByText('No laboratory notes recorded.')).toBeInTheDocument();
  });

  it('shows analyzed_by name', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Juan dela Cruz, RMT')).toBeInTheDocument();
  });

  it('shows Pending when analyzed_by is null', () => {
    renderDetail(mockPendingResult);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows smart_diagnosis_unavailable notice when true', () => {
    renderDetail(mockSmartDiagUnavailable);
    expect(
      screen.getByText(/Automated smart diagnosis was not available/)
    ).toBeInTheDocument();
  });

  it('hides smart_diagnosis_unavailable notice when false', () => {
    renderDetail(mockResult);
    expect(
      screen.queryByText(/Automated smart diagnosis was not available/)
    ).not.toBeInTheDocument();
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

  it('shows AI disclaimer', () => {
    renderDetail(mockResult);
    expect(
      screen.getByText(/UroLens is a clinical decision-support tool/)
    ).toBeInTheDocument();
  });

  it('shows preliminary notice banner for non-released results', () => {
    renderDetail(mockPendingResult);
    expect(
      screen.getByText(/This result is currently under review/)
    ).toBeInTheDocument();
  });

  it('does not show preliminary notice for RELEASED results', () => {
    renderDetail(mockResult);
    expect(
      screen.queryByText(/This result is currently under review/)
    ).not.toBeInTheDocument();
  });
});
