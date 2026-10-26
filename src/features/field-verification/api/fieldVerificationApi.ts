// API client for the multi-field verification workspace.
//
// Every call here hits a route that exists only as a stub as of
// urolens-backend PR #91 (feat/multifield-foundation): with
// FIELD_WORKFLOW_ENABLED unset (the default), every one of them answers
// 404 FEATURE_DISABLED; with it set, 501 NOT_IMPLEMENTED. Shapes match
// docs/contract/field-shapes.json exactly, so once a lane implements a
// route for real, nothing here should need to change — only the
// backend's response stops being a stub.
//
// Scope: web-owned routes only (foundation-plan.md §4.1's "owner lane"
// column). accept and submit are mobile-only and have no caller here.
// discard is shared (mobile + web); included since web needs it for
// "Exclude Field" during verification.
import apiClient from '../../../lib/apiClient';
import type {
  DiscardFieldRequest,
  FieldActionResponse,
  FieldDetail,
  FieldListResponse,
  FieldOverrideRequest,
  ResultStatusResponse,
  RevertOverrideRequest,
  SaveFieldAnnotationsRequest,
  VerificationQueueResponse,
  VerificationSummaryResponse,
} from '../types';

// GET /api/v1/results/medtech/pending — the REAL, already-working route
// (unlike everything else in this file). Typed against
// VerificationQueueItem, whose field-count properties are optional
// until a lane adds MedtechPendingFieldCounts to this response.
export async function fetchVerificationQueue(
  page: number,
  pageSize: number,
): Promise<VerificationQueueResponse> {
  const { data } = await apiClient.get<VerificationQueueResponse>('/results/medtech/pending', {
    params: { page, page_size: pageSize },
  });
  return data;
}

// GET /api/v1/results/{id}/fields — MEDTECH, SUPERVISOR.
export async function fetchResultFields(resultId: string): Promise<FieldListResponse> {
  const { data } = await apiClient.get<FieldListResponse>(`/results/${resultId}/fields`);
  return data;
}

// GET /api/v1/fields/{field_id} — MEDTECH, SUPERVISOR. Opening a field
// this way is what lets the same user mark it checked afterwards
// (FIELD_NOT_OPENED otherwise).
export async function fetchFieldDetail(fieldId: string): Promise<FieldDetail> {
  const { data } = await apiClient.get<FieldDetail>(`/fields/${fieldId}`);
  return data;
}

// PUT /api/v1/fields/{field_id}/annotations — MEDTECH only. Replaces
// the field's full edit list. A stale expectedVersion answers 409
// FIELD_VERSION_CONFLICT and writes nothing — re-fetch the field for
// its current version before retrying.
export async function saveFieldAnnotations(
  fieldId: string,
  request: SaveFieldAnnotationsRequest,
): Promise<FieldActionResponse> {
  const { data } = await apiClient.put<FieldActionResponse>(
    `/fields/${fieldId}/annotations`,
    request,
  );
  return data;
}

// POST /api/v1/fields/{field_id}/override — MEDTECH only.
export async function overrideFieldParameter(
  fieldId: string,
  request: FieldOverrideRequest,
): Promise<FieldActionResponse> {
  const { data } = await apiClient.post<FieldActionResponse>(
    `/fields/${fieldId}/override`,
    request,
  );
  return data;
}

// POST /api/v1/fields/{field_id}/override/revert — MEDTECH only.
// Returns the field's count to its AI/box-derived value.
export async function revertFieldOverride(
  fieldId: string,
  request: RevertOverrideRequest,
): Promise<FieldActionResponse> {
  const { data } = await apiClient.post<FieldActionResponse>(
    `/fields/${fieldId}/override/revert`,
    request,
  );
  return data;
}

// POST /api/v1/fields/{field_id}/verify — MEDTECH only. Marks the field
// checked; any later correction to it clears the mark server-side.
export async function verifyField(fieldId: string): Promise<FieldActionResponse> {
  const { data } = await apiClient.post<FieldActionResponse>(`/fields/${fieldId}/verify`);
  return data;
}

// POST /api/v1/fields/{field_id}/discard — MEDTECH only, shared with
// mobile. Reason is required on the web path (service-enforced, not
// schema-enforced).
export async function discardField(
  fieldId: string,
  request: DiscardFieldRequest,
): Promise<FieldActionResponse> {
  const { data } = await apiClient.post<FieldActionResponse>(`/fields/${fieldId}/discard`, request);
  return data;
}

// POST /api/v1/results/{id}/reopen-capture — MEDTECH only. Sends the
// result back to CAPTURING for more fields on mobile; existing fields
// and corrections are kept.
export async function reopenCapture(resultId: string): Promise<ResultStatusResponse> {
  const { data } = await apiClient.post<ResultStatusResponse>(
    `/results/${resultId}/reopen-capture`,
  );
  return data;
}

// GET /api/v1/results/{id}/summary — MEDTECH, SUPERVISOR. The numbers
// confirmation will store, for the verification workspace's final step.
export async function fetchVerificationSummary(
  resultId: string,
): Promise<VerificationSummaryResponse> {
  const { data } = await apiClient.get<VerificationSummaryResponse>(`/results/${resultId}/summary`);
  return data;
}
