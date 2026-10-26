// Types for the multi-field verification workspace. Rebuilt from the
// REAL, merged backend contract — urolens-backend PR #91
// (feat/multifield-foundation, `docs/contract/field-shapes.json` +
// `docs/foundation-plan.md`) — not the original proposal doc, which got
// the box coordinate convention, the concurrency model, and several
// fields wrong or simply didn't have them (magnification, version,
// flags, GET /results/{id}/summary).
//
// Field names here are snake_case, matching this app's convention —
// apiClient's interceptor translates to/from the backend's camelCase at
// the request/response boundary (see src/lib/apiClient.ts), so these
// shapes don't need to mirror the JSON schema's casing.
//
// IMPORTANT: every route this feature calls is a stub as of PR #91.
// With FIELD_WORKFLOW_ENABLED unset (the default), every one of them
// answers 404 FEATURE_DISABLED; with it set, 501 NOT_IMPLEMENTED. None
// of this is functional yet — these types exist so the UI layer can be
// built and type-checked against the real shapes ahead of time.

export type FieldStatus = 'ANALYZED' | 'ACCEPTED' | 'DISCARDED';

export type Magnification = 'HPF' | 'LPF';

export type ResultStatus =
  | 'CAPTURING'
  | 'PENDING_CONFIRM'
  | 'PENDING_SUPERVISOR_APPROVAL'
  | 'APPROVED'
  | 'RELEASED'
  | 'RETURNED_FOR_CORRECTION'
  | 'CRITICAL_ESCALATED'
  | 'IMAGE_RETAKE_REQUESTED'
  | 'FAILED';

// Why a field is flagged for a closer look. Computed when read, not
// stored (field-shapes.json: FieldFlag).
export type FieldFlagReason = 'LOW_CONFIDENCE' | 'OUTLIER_COUNT' | 'ABOVE_NORMAL_MAX';

export interface FieldFlag {
  reason: FieldFlagReason;
  particle_type: string | null;
}

// One AI box. id is assigned by the backend, stable within a field.
// Percent {x,y,w,h} of the upright image — the same convention
// AnnotationCanvas already uses for BoundingBox, NOT pixels as the
// original proposal doc said.
export interface Detection {
  id: string;
  particle_type: string;
  confidence: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

// A box the MedTech drew — same shape as Detection minus confidence,
// with an id already assigned (server echo, e.g. in FieldDetail's
// annotation_edits).
export interface AddedBox {
  id: string;
  particle_type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// A box to add, as sent by the client — no id, the backend assigns one.
export interface AddedBoxInput {
  particle_type: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// The current (not superseded) box edits on a field.
export interface FieldAnnotationEdits {
  removed_detection_ids: string[];
  added_boxes: AddedBox[];
  edited_by: string | null;
  edited_at: string | null;
}

// The override currently in force for one class of a field.
export interface FieldOverride {
  particle_type: string;
  original_ai_value: number;
  corrected_value: number;
  rationale: string;
  overridden_by: string;
  overridden_at: string;
}

// One row of GET /results/{id}/fields. Never carries detections.
export interface FieldSummaryItem {
  field_id: string;
  result_id: string;
  field_no: number;
  magnification: Magnification;
  status: FieldStatus;
  ai_findings: Record<string, number>;
  effective_counts: Record<string, number>;
  confidence_scores: Record<string, number>;
  version: number;
  created_at: string;
  updated_at: string;
  flags: FieldFlag[];
  has_corrections: boolean;
  overridden_classes: string[];
  image_url: string | null;
  discard_reason: string | null;
  verified_by: string | null;
  verified_at: string | null;
}

// GET /fields/{field_id}: one field in full. Opening a field this way
// is what lets the same user mark it as checked afterwards
// (FIELD_NOT_OPENED guards verify/override/annotations otherwise).
export interface FieldDetail extends FieldSummaryItem {
  detections: Detection[];
  image_width: number;
  image_height: number;
  annotation_edits: FieldAnnotationEdits;
  model_version: string;
  overrides: FieldOverride[];
  smart_diagnosis_preview: Record<string, unknown> | null;
  smart_diagnosis_unavailable: boolean;
}

// GET /results/{id}/fields.
export interface FieldListResponse {
  result_id: string;
  result_status: ResultStatus;
  min_fields: number;
  accepted_field_count: number;
  verified_field_count: number;
  undecided_field_count: number;
  items: FieldSummaryItem[];
}

// Returned by accept, discard, annotations, override, revert and verify
// — one field plus the running totals, so the client updates both in
// one round trip.
export interface FieldActionResponse {
  field: FieldSummaryItem;
  accepted_field_count: number;
  verified_field_count: number;
  undecided_field_count: number;
}

// Returned by submit (mobile) and reopen-capture (web).
export interface ResultStatusResponse {
  result_id: string;
  status: ResultStatus;
  updated_at: string;
}

// PUT /fields/{field_id}/annotations: the full list of edits, replacing
// the previous list. A stale expected_version answers 409
// FIELD_VERSION_CONFLICT and writes nothing — read the field (which
// bumps nothing) or re-open it to get the current version before
// retrying.
export interface SaveFieldAnnotationsRequest {
  removed_detection_ids: string[];
  added_boxes: AddedBoxInput[];
  expected_version: number;
}

// POST /fields/{field_id}/override.
export interface FieldOverrideRequest {
  particle_type: string;
  // Whole number 0 to 1000 (schemas/field.py's own MAX_FIELD_COUNT, not
  // the result-level MAX_OVERRIDE_COUNT=300 the web lane still uses
  // elsewhere).
  corrected_value: number;
  rationale: string;
}

// POST /fields/{field_id}/override/revert — new vs. the original
// proposal, returns a field's count to its AI/box-derived value.
export interface RevertOverrideRequest {
  particle_type: string;
  rationale: string;
}

export interface DiscardFieldRequest {
  // Optional on the mobile path, required on the web path — the
  // backend service enforces which, not the schema.
  reason?: string | null;
}

// One class over the accepted fields — the unrounded figure the
// verification summary and (once confirmed) the result itself show.
// display_value is pre-formatted server-side, e.g. "<1" for a
// seen-but-rare finding (proposal §3.3) — render it directly rather
// than re-deriving "<1" client-side.
export interface ParticleAggregate {
  mean: number;
  min: number;
  max: number;
  total: number;
  fields_seen: number;
  ai_mean: number;
  display_value: string;
  // Field numbers (field_no) where this class exceeded its normal max,
  // even if the average looks fine — feeds FocalFinding.
  fields_above_normal: number[];
}

export type SummaryCorrectionKind = 'BOXES' | 'OVERRIDE';

// One correction made during verification, for the "what changed" list
// on the summary step.
export interface SummaryCorrection {
  field_id: string;
  field_no: number;
  particle_type: string;
  ai_value: number;
  effective_value: number;
  kind: SummaryCorrectionKind;
}

// A class that's above its normal max in one or more fields even though
// the average looks normal — surfaced separately so an outlier field
// doesn't get averaged away unnoticed.
export interface FocalFinding {
  particle_type: string;
  field_nos: number[];
}

export type SummaryBlockingReason = 'FIELDS_BELOW_MINIMUM' | 'FIELDS_NOT_VERIFIED';

// GET /results/{id}/summary: the numbers confirmation will store, shown
// on the verification workspace's final step before Confirm.
export interface VerificationSummaryResponse {
  result_id: string;
  field_count: number;
  min_fields: number;
  per_class: Record<string, ParticleAggregate>;
  can_confirm: boolean;
  blocking_reason: SummaryBlockingReason | null;
  corrections: SummaryCorrection[];
  focal_findings: FocalFinding[];
  smart_diagnosis_preview: Record<string, unknown> | null;
  smart_diagnosis_unavailable: boolean;
}

// Additions to GET /results/medtech/pending's items — field-shapes.json
// documents the shape, but this route itself hasn't been changed to
// send them yet (foundation-plan.md: lane work, not part of PR #91).
// Optional here on purpose: VerificationQueueItem below is read from
// the REAL, already-working /results/medtech/pending today, which
// sends everything except these three. They go from absent to present
// the moment a lane wires MedtechPendingFieldCounts onto that route —
// no frontend change needed when that happens.
export interface MedtechPendingFieldCounts {
  field_count: number;
  verified_field_count: number;
  flagged_field_count: number;
}

export interface VerificationQueueItem extends Partial<MedtechPendingFieldCounts> {
  result_id: string;
  specimen_id: string;
  patient_uid: string;
  patient_name: string;
  patient_age: number | null;
  patient_sex: string | null;
  status: 'PENDING_CONFIRM' | 'RETURNED_FOR_CORRECTION';
  return_reason: string | null;
}

export interface VerificationQueueResponse {
  items: VerificationQueueItem[];
  total: number;
  page: number;
  page_size: number;
}

// Additions to GET /results/{result_id}, once a lane wires them onto
// the existing response (foundation-plan.md Q10: currently schema-only,
// not in OpenAPI). Kept separate from result-review's FullResultDetail
// rather than editing that live type now.
export interface FullResultFieldAdditions {
  fields: FieldSummaryItem[];
  field_count: number;
  field_summary: Record<string, ParticleAggregate> | null;
}

// Backend error codes this feature's routes can answer with, once the
// flag is on (foundation-plan.md §3.4) — for utils/errors.ts-style
// per-code message mapping when that's wired up.
export type FieldErrorCode =
  | 'IMAGE_NOT_MICROSCOPY'
  | 'IMAGE_EXPOSURE'
  | 'APP_UPDATE_REQUIRED'
  | 'FIELD_NOT_OPENED'
  | 'FIELD_VERSION_CONFLICT'
  | 'FIELDS_UNDECIDED'
  | 'FIELDS_BELOW_MINIMUM'
  | 'FIELDS_NOT_VERIFIED'
  | 'FEATURE_DISABLED'
  | 'NOT_IMPLEMENTED';
