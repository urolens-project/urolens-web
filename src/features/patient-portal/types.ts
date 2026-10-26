export interface ParticleCount {
  label: string;
  count: number;
  // Multi-field addition (Module 2 Update Proposal §3.3/§10.3):
  // pre-formatted by the backend, e.g. "<1" for a seen-but-rare finding
  // that would otherwise round to 0 — render this directly rather than
  // re-deriving "<1" client-side. Optional and absent today; CellCountTable
  // falls back to the raw count until a lane sends it.
  display_value?: string;
}

export type ResultStatus =
  'PENDING' | 'CONFIRMED' | 'PENDING_SUPERVISOR_APPROVAL' | 'APPROVED' | 'RELEASED';

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
  requesting_physician: string | null;
  particle_counts: ParticleCount[];
  particle_classes: string[];
  smart_diagnosis_unavailable: boolean;
  test_type: string;
  released_at: string | null;
  // Multi-field addition (proposal §10.3): "Counts are labelled 'average
  // per field' with the number of fields examined." Optional, absent
  // today.
  fields_examined?: number;
}
