import type { SmartDiagnosisAttached } from '../smart-diagnosis/types';
import type { FieldSummaryItem, ParticleAggregate } from '../field-verification/types';

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
  // null if the specimen has none yet (visual check not passed) or wasn't found.
  sample_uid: string | null;
  patient_uid: string;
  patient_age: number | null;
  patient_sex: string | null;
  medtech_name: string;
  confirmed_at: string | null;
  status: string;
  // Same optional, lane-pending pattern as FullResultDetail.fields —
  // GET /results/supervisor/pending doesn't send these yet.
  field_count?: number;
  verified_field_count?: number;
}

export interface PendingResultListResponse {
  items: PendingResultItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface BoundingBox {
  id: string;
  particle_type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// One AI-detected particle box, before any reviewer has drawn their own
// annotation. Read-only data from the AI pipeline, not a reviewer's saved
// work — see MicroscopyImageSection for how this seeds the canvas.
export interface AiDetectionBox extends BoundingBox {
  confidence: number | null;
}

// One reviewer's annotation on a result. A MedTech's and a Supervisor's
// annotations are independent — this is one entry in FullResultDetail's
// `annotations` list, not the whole thing.
export interface AnnotationItem {
  reviewed_by: string;
  reviewer_role: string;
  annotation_notes: string | null;
  spatial_annotations: BoundingBox[] | null;
  updated_at: string;
}

export interface FullResultDetail {
  result_id: string;
  specimen_id: string;
  patient_uid: string;
  patient_age: number | null;
  patient_sex: string | null;
  medtech_name: string;
  confirmed_at: string | null;
  confirmation_notes: string | null;
  ai_findings: Record<string, unknown>;
  ai_detections: AiDetectionBox[];
  flagged_anomalies: Record<string, unknown>;
  particle_classes: Record<string, unknown>;
  model_version: string;
  manual_overrides: ManualOverrideItem[];
  image_url: string | null;
  smart_diagnosis: SmartDiagnosisAttached | null;
  smart_diagnosis_unavailable: boolean;
  status: string;
  is_retake_pending: boolean;
  annotations: AnnotationItem[];
  // Multi-field additions (Module 2 Update Proposal §3.2/§10.2,
  // urolens-backend PR #91's FullResultFieldAdditions). Optional and
  // absent from every response today — GET /results/{result_id} hasn't
  // been changed to send them yet (foundation-plan.md Q10: lane work).
  // Every reader of these three fields must treat absence as "this is a
  // legacy single-image result", not as missing/loading data.
  fields?: FieldSummaryItem[];
  field_count?: number;
  field_summary?: Record<string, ParticleAggregate> | null;
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

export interface SupervisorStats {
  pending_count: number;
  approved_today: number;
  escalated_count: number;
}

export interface ApprovedResultItem {
  result_id: string;
  // null if the underlying result row wasn't found.
  specimen_id: string | null;
  sample_uid: string | null;
  patient_uid: string;
  patient_age: number | null;
  patient_sex: string | null;
  medtech_name: string;
  approved_at: string;
  status: string;
}

export interface ApprovedTodayListResponse {
  items: ApprovedResultItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface EscalatedResultItem {
  result_id: string;
  specimen_id: string;
  sample_uid: string | null;
  patient_uid: string;
  patient_age: number | null;
  patient_sex: string | null;
  medtech_name: string;
  escalated_at: string;
  escalation_path: string;
  status: string;
}

export interface EscalatedListResponse {
  items: EscalatedResultItem[];
  total: number;
  page: number;
  page_size: number;
}

export type EscalationPath = 'NOTIFY_PHYSICIAN' | 'FLAG_SENIOR_REVIEW' | 'MARK_CRITICAL';

export const ESCALATION_PATH_LABELS: Record<EscalationPath, string> = {
  NOTIFY_PHYSICIAN: 'Notify Physician',
  FLAG_SENIOR_REVIEW: 'Flag for Senior Review',
  MARK_CRITICAL: 'Mark as Critical',
};
