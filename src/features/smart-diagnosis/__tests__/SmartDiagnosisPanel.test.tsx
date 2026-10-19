/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import { SmartDiagnosisPanel } from '../components/SmartDiagnosisPanel';
import type { ConditionEvidence, EvidenceMap, SmartDiagnosisAttached } from '../types';

const DISCLAIMER_TEXT = /AI-generated findings and/i;

function makeConditionEvidence(level: ConditionEvidence['level'] = 'LOW'): ConditionEvidence {
  return { level, weighted_score: 0, evidence: [] };
}

const EMPTY_EVIDENCE_MAP: EvidenceMap = {
  gout: makeConditionEvidence(),
  glomerulonephritis: makeConditionEvidence(),
  nephrolithiasis: makeConditionEvidence(),
};

describe('SmartDiagnosisPanel', () => {
  it('shows the mandatory AI disclaimer when unavailable', () => {
    render(<SmartDiagnosisPanel data={null} unavailable />);
    expect(screen.getByText(DISCLAIMER_TEXT)).toBeInTheDocument();
  });

  it('shows the disclaimer exactly once when there are no significant indicators', () => {
    const data: SmartDiagnosisAttached = {
      gout_score: 'LOW',
      gn_score: 'LOW',
      nephro_score: 'LOW',
      no_significant_indicators: true,
      evidence_map: EMPTY_EVIDENCE_MAP,
      engine_version: 'v1',
    };
    render(<SmartDiagnosisPanel data={data} />);
    expect(screen.getAllByText(DISCLAIMER_TEXT)).toHaveLength(1);
  });

  it('shows the disclaimer exactly once when conditions are present', () => {
    const data: SmartDiagnosisAttached = {
      gout_score: 'HIGH',
      gn_score: 'LOW',
      nephro_score: 'LOW',
      no_significant_indicators: false,
      evidence_map: EMPTY_EVIDENCE_MAP,
      engine_version: 'v1',
    };
    render(<SmartDiagnosisPanel data={data} />);
    expect(screen.getAllByText(DISCLAIMER_TEXT)).toHaveLength(1);
  });
});
