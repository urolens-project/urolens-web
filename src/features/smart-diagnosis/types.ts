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
  gout: ConditionEvidence | Record<string, unknown>;
  glomerulonephritis: ConditionEvidence | Record<string, unknown>;
  nephrolithiasis: ConditionEvidence | Record<string, unknown>;
}

export interface SmartDiagnosisOutput {
  output_id: string;
  result_id: string;
  gout_score: ProbabilityLevel;
  gn_score: ProbabilityLevel;
  nephro_score: ProbabilityLevel;
  evidence_map: EvidenceMap;
  no_significant_indicators: boolean;
  engine_version: string;
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
