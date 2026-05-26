export type ReleaseMethod = 'PHYSICAL' | 'DIGITAL';

export interface ApprovedResultItem {
  result_id: string;
  patient_name: string;
  sample_uid: string | null;
  test_type: string | null;
  approved_at: string;
}

export interface ReleaseResultRequest {
  release_method: ReleaseMethod;
}

export interface ResultReleaseResponse {
  release_id: string;
  result_id: string;
  released_by: string;
  release_method: ReleaseMethod;
  released_at: string;
}

export interface PaginationMeta {
  next_cursor: string | null;
  has_more: boolean;
}

export interface ApprovedResultsResponse {
  data: ApprovedResultItem[];
  pagination: PaginationMeta;
}
