// ── Receptionist-facing types (STORY-WEB-08) ─────────────────────────────────

export interface PendingSpecimenItem {
  specimen_id: string;
  sample_uid: string;
  patient_name: string;
  test_type: string;
  received_at: string;
  status: string;
}

export interface MedTechWorkloadItem {
  user_id: string;
  full_name: string;
  active_count: number;
}

export interface AssignSpecimenRequest {
  specimen_id: string;
  medtech_id: string;
}

export interface QueueAssignmentResponse {
  assignment_id: string;
  specimen_id: string;
  medtech_id: string;
  assigned_by: string;
  assigned_at: string;
  status: string;
}

// ── Mobile Developer types (do not modify) ────────────────────────────────────

export interface MedTechWorkload {
  medtech_id: string;
  username: string;
  queue_count: number;
}

export interface QueueAssignRequest {
  specimen_id: string;
  medtech_id: string;
}

export interface QueueAssignResponse {
  assignment_id: string;
  specimen_id: string;
  medtech_id: string;
  assigned_by: string;
  assigned_at: string;
  status: string;
}

export interface SpecimenResponse {
  specimen_id: string;
  sample_uid: string | null;
  status: string;
  received_at?: string;
  labeled_at?: string;
}
