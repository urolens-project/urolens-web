export interface CellCounts {
  rbc: number;
  wbc: number;
  epithelial_cells: number;
  casts: number;
  bacteria: number;
  crystals: number;
  mucus_threads: number;
}

export interface PatientResultSummary {
  result_id: string;
  specimen_id: string;
  status: string;
  released_at: string | null;
  created_at: string;
}

export interface PatientResultDetail {
  result_id: string;
  specimen_id: string;
  status: string;
  cell_counts: CellCounts | null;
  interpretation: string | null;
  medtech_name: string | null;
  pathologist_name: string | null;
  pathologist_license: string | null;
  confirmed_at: string | null;
  released_at: string | null;
  created_at: string;
}
