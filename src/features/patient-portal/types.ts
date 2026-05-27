export interface ParticleCount {
  label: string;
  count: number;
}

export type ResultStatus =
  | 'PENDING'
  | 'PENDING_CONFIRM'
  | 'CONFIRMED'
  | 'PENDING_SUPERVISOR_APPROVAL'
  | 'APPROVED'
  | 'RELEASED';

export interface PatientResultSummary {
  result_id: string;
  specimen_id: string;
  status: ResultStatus;
  released_at: string | null;
  created_at: string;
}

export interface PatientResultDetail {
  result_id: string;
  specimen_id: string;
  status: ResultStatus;
  particle_counts: ParticleCount[];
  analyzed_by: string | null;
  confirmation_notes: string | null;
  smart_diagnosis_unavailable: boolean;
  confirmed_at: string | null;
  released_at: string | null;
  created_at: string;
}
