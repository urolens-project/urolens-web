/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PatientResultDetail } from '../components/PatientResultDetail';
import type { PatientResultDetail as DetailType } from '../types';

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
  cell_counts: {
    rbc: 5,
    wbc: 2,
    epithelial_cells: 0,
    casts: 1,
    bacteria: 0,
    crystals: 0,
    mucus_threads: 0,
  },
  interpretation: 'Normal urinalysis findings.',
  medtech_name: 'Dr. Santos',
  pathologist_name: 'Dr. Reyes',
  pathologist_license: 'PRC-123456',
  confirmed_at: '2026-05-16T10:00:00Z',
  released_at: '2026-05-20T10:00:00Z',
  created_at: '2026-05-15T08:00:00Z',
};

const mockPendingResult: DetailType = {
  result_id: 'def67890-1234',
  specimen_id: 'spec-002',
  status: 'PENDING',
  cell_counts: null,
  interpretation: null,
  medtech_name: null,
  pathologist_name: null,
  pathologist_license: null,
  confirmed_at: null,
  released_at: null,
  created_at: '2026-05-16T09:00:00Z',
};

describe('PatientResultDetail', () => {
  it('renders all four sections', () => {
    renderDetail(mockResult);

    expect(screen.getByText('Urinalysis Cell Count Findings')).toBeInTheDocument();
    expect(screen.getByText('Clinical Interpretation')).toBeInTheDocument();
    expect(screen.getByText('Verified By')).toBeInTheDocument();
    expect(screen.getByText('Back to My Results')).toBeInTheDocument();
  });

  it('renders result ID and status chip', () => {
    renderDetail(mockResult);
    expect(screen.getByRole('heading', { name: /abc12345/ })).toBeInTheDocument();
    expect(screen.getByText('Released')).toBeInTheDocument();
  });

  it('shows interpretation text when available', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Normal urinalysis findings.')).toBeInTheDocument();
  });

  it('shows pending message when interpretation is null', () => {
    renderDetail(mockPendingResult);
    expect(screen.getByText(/Interpretation pending/)).toBeInTheDocument();
  });

  it('shows medtech and pathologist names', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Dr. Santos')).toBeInTheDocument();
    expect(screen.getByText('Dr. Reyes')).toBeInTheDocument();
    expect(screen.getByText('Lic. No: PRC-123456')).toBeInTheDocument();
  });

  it('shows Pending for null names', () => {
    renderDetail(mockPendingResult);
    const pendingTexts = screen.getAllByText('Pending');
    expect(pendingTexts.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText('Lic. No: Pending')).toBeInTheDocument();
  });

  it('shows Download PDF button for RELEASED results', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });

  it('hides Download PDF button for non-RELEASED results', () => {
    renderDetail(mockPendingResult);
    expect(screen.queryByText('Download PDF')).not.toBeInTheDocument();
  });

  it('calls onDownloadPdf when Download PDF is clicked', async () => {
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

  it('renders cell count data when available', () => {
    renderDetail(mockResult);
    expect(screen.getByText('Red Blood Cells (RBC)')).toBeInTheDocument();
  });

  it('shows cell count empty state when null', () => {
    renderDetail(mockPendingResult);
    expect(screen.getByText('Cell count data not yet available.')).toBeInTheDocument();
  });
});
