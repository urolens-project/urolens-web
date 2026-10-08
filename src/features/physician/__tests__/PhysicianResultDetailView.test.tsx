/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PhysicianResultDetailView } from '../components/PhysicianResultDetailView';
import { useResultDetail } from '../hooks/usePhysician';
import type { PhysicianResultDetail } from '../types';

vi.mock('../hooks/usePhysician', () => ({
  useResultDetail: vi.fn(),
}));

function makeResult(overrides: Partial<PhysicianResultDetail> = {}): PhysicianResultDetail {
  return {
    result_id: 'r-1',
    specimen_id: 'specimen-uuid-1234',
    patient_name: 'Maria Santos',
    patient_uid: 'PAT-000001',
    patient_age: 34,
    patient_sex: 'FEMALE',
    medtech_name: 'jdelacruz',
    confirmed_at: '2026-09-28T09:12:00+08:00',
    ai_findings: {},
    flagged_anomalies: {},
    particle_classes: {},
    model_version: 'mvp-v1.0',
    smart_diagnosis: null,
    image_url: null,
    status: 'APPROVED',
    annotation_notes: null,
    ...overrides,
  };
}

function renderAt(resultId: string) {
  return render(
    <MemoryRouter initialEntries={[`/physician/results/${resultId}`]}>
      <Routes>
        <Route path="/physician/results/:resultId" element={<PhysicianResultDetailView />} />
      </Routes>
    </MemoryRouter>,
  );
}

const DISCLAIMER_TEXT = /AI-generated findings and/i;

describe('PhysicianResultDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the AI disclaimer exactly once, not twice', () => {
    vi.mocked(useResultDetail).mockReturnValue({
      data: makeResult(),
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResultDetail>);

    renderAt('r-1');

    expect(screen.getAllByText(DISCLAIMER_TEXT)).toHaveLength(1);
  });

  it('still renders the disclaimer once when Smart Diagnosis is unavailable', () => {
    vi.mocked(useResultDetail).mockReturnValue({
      data: makeResult({ smart_diagnosis: null }),
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useResultDetail>);

    renderAt('r-1');

    expect(screen.getAllByText(DISCLAIMER_TEXT)).toHaveLength(1);
  });
});
