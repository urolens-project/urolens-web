export interface ManualOverrideItem {
  override_id: string;
  parameter_name: string;
  original_ai_value: string;
  corrected_value: string;
  rationale: string;
  overridden_at: string;
}

export interface PendingResultItem {
  result_id: string;
  specimen_id: string;
  patient_name: string;
  patient_age: number | null;
  patient_sex: string | null;
  medtech_name: string;
  confirmed_at: string | null;
  status: string;
}

export interface PendingResultListResponse {
  items: PendingResultItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface BoundingBox {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FullResultDetail {
  result_id: string;
  specimen_id: string;
  patient_name: string;
  patient_age: number | null;
  patient_sex: string | null;
  medtech_name: string;
  confirmed_at: string | null;
  confirmation_notes: string | null;
  ai_findings: Record<string, unknown>;
  flagged_anomalies: Record<string, unknown>;
  particle_classes: Record<string, unknown>;
  model_version: string;
  manual_overrides: ManualOverrideItem[];
  image_url: string | null;
  smart_diagnosis_unavailable: boolean;
  status: string;
  annotation_notes: string | null;
  spatial_annotations: BoundingBox[] | null;
}

export interface AnnotationResponse {
  result_id: string;
  annotation_notes: string;
  spatial_annotations: BoundingBox[] | null;
}

export interface OverrideResponse {
  id: string;
  result_id: string;
  parameter: string;
  original_ai_value: number;
  corrected_value: number;
  rationale: string;
  overridden_by: string;
  overridden_at: string;
}

export interface ApproveResponse {
  result_id: string;
  status: string;
  approved_at: string;
}

export interface ReturnResponse {
  result_id: string;
  status: string;
  returned_at: string;
}

export interface EscalateResponse {
  result_id: string;
  status: string;
  escalation_path: string;
  escalated_at: string;
}

export type EscalationPath = 'NOTIFY_PHYSICIAN' | 'FLAG_SENIOR_REVIEW' | 'MARK_CRITICAL';

export const ESCALATION_PATH_LABELS: Record<EscalationPath, string> = {
  NOTIFY_PHYSICIAN: 'Notify Physician',
  FLAG_SENIOR_REVIEW: 'Flag for Senior Review',
  MARK_CRITICAL: 'Mark as Critical',
};
