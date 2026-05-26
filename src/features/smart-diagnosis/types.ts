export type ProbabilityLevel = 'LOW' | 'MODERATE' | 'HIGH';

export type SmartDiagnosisStatus = 'ATTACHED' | 'FLAGGED_UNAVAILABLE';

export interface EvidenceMap {
  gout: string[];
  uti: string[];
  tricho: string[];
}

export interface SmartDiagnosisOutput {
  output_id: string;
  result_id: string;
  gout_score: ProbabilityLevel;
  uti_score: ProbabilityLevel;
  tricho_score: ProbabilityLevel;
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
  evidence: string[];
}
