export interface ApprovedResultItem {
  result_id: string;
  patient_uid: string;
  sample_uid: string | null;
  test_type: string | null;
  approved_at: string;
}

export interface PaginationMeta {
  next_cursor: string | null;
  has_more: boolean;
}

export interface ApprovedResultsResponse {
  data: ApprovedResultItem[];
  pagination: PaginationMeta;
}

export type ReleaseMethod = 'PHYSICAL' | 'DIGITAL';

export interface ReleaseResultRequest {
  release_method: ReleaseMethod;
}

export interface ResultReleaseResponse {
  release_id: string;
  result_id: string;
  released_by: string;
  release_method: string;
  released_at: string;
}