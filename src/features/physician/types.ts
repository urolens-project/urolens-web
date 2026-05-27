export interface PhysicianPatient {
  patient_id: string;
  patient_uid: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth: string;
  sex: string;
}

export interface LabRequestCreatePayload {
  patient_id: string;
  test_type: string;
  clinical_notes?: string | null;
}

export interface LabRequestCreateResponse {
  request_uid: string;
  patient_id: string;
  physician_name: string;
  test_type: string;
  status: string;
  created_at: string;
}

export interface PhysicianResultSummary {
  result_id: string;
  specimen_id: string;
  patient_name: string;
  patient_uid: string;
  patient_age: number | null;
  patient_sex: string | null;
  status: string;
  confirmed_at: string | null;
  created_at: string;
}

export interface PhysicianResultListResponse {
  items: PhysicianResultSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface SmartDiagnosisDetail {
  gout_score: string;
  gn_score: string;
  nephro_score: string;
  uti_score: string;
  tricho_score: string;
  evidence_map: Record<string, string[]>;
  no_significant_indicators: boolean;
  engine_version: string;
}

export interface PhysicianResultDetail {
  result_id: string;
  specimen_id: string;
  patient_name: string;
  patient_uid: string;
  patient_age: number | null;
  patient_sex: string | null;
  medtech_name: string | null;
  confirmed_at: string | null;
  ai_findings: Record<string, unknown>;
  flagged_anomalies: Record<string, unknown>;
  particle_classes: Record<string, unknown>;
  model_version: string;
  smart_diagnosis: SmartDiagnosisDetail | null;
  image_url: string | null;
  status: string;
  annotation_notes: string | null;
}
