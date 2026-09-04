export type ProbabilityLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type SmartDiagnosisStatus = 'ATTACHED' | 'FLAGGED_UNAVAILABLE';

export interface EvidenceEntry {
  particle_name: string;
  particle_display_name: string;
  detected_count: number;
  normal_range_max: number;
  contribution_weight: number;
  contribution_score: number;
  contribution_role: string;
}

export interface ConditionEvidence {
  level: ProbabilityLevel;
  weighted_score: number;
  evidence: EvidenceEntry[];
}

export interface EvidenceMap {
  gout: ConditionEvidence;
  glomerulonephritis: ConditionEvidence;
  nephrolithiasis: ConditionEvidence;
}

/** Fields present whenever the Smart Diagnosis engine successfully attached a result. */
export interface SmartDiagnosisAttached {
  gout_score: ProbabilityLevel;
  gn_score: ProbabilityLevel;
  nephro_score: ProbabilityLevel;
  evidence_map: EvidenceMap;
  no_significant_indicators: boolean;
  engine_version: string;
}

export interface SmartDiagnosisOutput extends SmartDiagnosisAttached {
  output_id: string;
  result_id: string;
  status: SmartDiagnosisStatus;
  generated_at: string;
}

export interface SmartDiagnosisUnavailable {
  status: 'FLAGGED_UNAVAILABLE';
  result_id: string;
}

export type SmartDiagnosisResponse = SmartDiagnosisOutput | SmartDiagnosisUnavailable;

export function isDiagnosisUnavailable(
  res: SmartDiagnosisResponse,
): res is SmartDiagnosisUnavailable {
  return res.status === 'FLAGGED_UNAVAILABLE';
}

export interface ConditionResult {
  label: string;
  score: ProbabilityLevel;
  evidence: EvidenceEntry[];
}

const CONDITION_LABELS: Record<keyof EvidenceMap, string> = {
  gout: 'Gout',
  glomerulonephritis: 'Glomerulonephritis',
  nephrolithiasis: 'Nephrolithiasis',
};

export function buildConditions(data: SmartDiagnosisAttached): ConditionResult[] {
  return [
    {
      label: CONDITION_LABELS.gout,
      score: data.gout_score,
      evidence: data.evidence_map.gout?.evidence ?? [],
    },
    {
      label: CONDITION_LABELS.glomerulonephritis,
      score: data.gn_score,
      evidence: data.evidence_map.glomerulonephritis?.evidence ?? [],
    },
    {
      label: CONDITION_LABELS.nephrolithiasis,
      score: data.nephro_score,
      evidence: data.evidence_map.nephrolithiasis?.evidence ?? [],
    },
  ];
}
