export interface ParticleCount {
  label: string;
  count: number;
}

export type ResultStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PENDING_SUPERVISOR_APPROVAL'
  | 'APPROVED'
  | 'RELEASED';

export interface PatientResultItem {
  result_id: string;
  test_type: string;
  status: string;
  released_at: string | null;
}

export interface PatientResultDetail {
  status: string;
  confirmed_at: string | null;
  confirmation_notes: string | null;
  analyzed_by: string | null;
  particle_counts: ParticleCount[];
  particle_classes: string[];
  smart_diagnosis_unavailable: boolean;
  test_type: string;
  released_at: string | null;
}
