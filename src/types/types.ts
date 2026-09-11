export interface PatientRegistrationPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  contact_number: string;
  complete_address: string;
  is_walkin: boolean;
  emergency_name?: string;
  emergency_relationship?: string;
  emergency_phone?: string;
}

/**
 * Server response contract following successful patient registration
 */
export interface PatientRegistrationResponse {
  success: boolean;
  patient_id: string;
  message: string;
  timestamp: string;
}

/**
 * Payload contract for Lab Request order encoding.
 * Supports both standard database relational mapping and manual text bypass entries.
 */
export interface LabRequestPayload {
  patient_id: string;
  physician_id?: string; // Added to capture clean relational user_id UUIDs from the database
  physician_name?: string; // Used as the fallback name string when manual override is toggled active
  test_type: string;
  clinical_notes?: string;
}

/**
 * Server response contract following successful lab request encoding.
 * Previously didn't match what the backend actually returns at all (no
 * `success`/`message`/`timestamp` fields exist on LabRequestCreateResponse)
 * — the confirmation screen's tracking-reference display always fell back
 * to its placeholder text instead of the real generated request UID.
 */
export interface LabRequestResponse {
  lab_request_id: string;
  request_uid: string; // Tracking reference, format: REQ-YYYYMMDD-XXXXX
  patient_id: string;
  physician_id: string | null;
  physician_name: string | null;
  test_type: string;
  clinical_notes: string | null;
  status: string;
  created_at: string;
}

export interface SpecimenReceivePayload {
  lab_request_id: string;
  visual_check_passed: boolean;
  rejection_reason?: string;
  free_text_note?: string;
}

export interface SpecimenReceiveResponse {
  success: boolean;
  specimen_id: string;
  sample_uid: string | null;
  status: 'RECEIVED' | 'REJECTED';
  message: string;
}

export interface LabelPreviewData {
  patient_name: string;
  patient_uid: string;
  sample_uid: string;
  test_type: string;
  date: string;
}

export interface PrintLabelResponse {
  success: boolean;
  label_id: string;
  print_job_id: string;
  preview: LabelPreviewData;
}

export interface ConfirmAffixedResponse {
  success: boolean;
  message: string;
  updated_status: string;
}
