export interface MedtechPendingItem {
  result_id: string;
  specimen_id: string;
  patient_uid: string;
  patient_name: string;
  patient_age: number | null;
  patient_sex: string | null;
  status: 'PENDING_CONFIRM' | 'RETURNED_FOR_CORRECTION';
  return_reason: string | null;
  // The field/particle a supervisor's return pointed at (urolens-backend
  // PR #103) — present only while RETURNED_FOR_CORRECTION and only when
  // the return named one.
  return_field_id?: string | null;
  return_particle_type?: string | null;
  // Present (and non-null) only for a multi-field capture — absent entirely
  // in the JSON, not sent as null, while the backend's multi-field workflow
  // flag is off (see MedtechPendingResultItem). A legacy single-image
  // result never has this.
  field_count?: number | null;
}

export interface MedtechPendingListResponse {
  items: MedtechPendingItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ConfirmResultResponse {
  id: string;
  result_id: string;
  confirmed_by: string;
  confirmed_at: string;
}
