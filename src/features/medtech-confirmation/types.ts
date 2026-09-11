export interface MedtechPendingItem {
  result_id: string;
  specimen_id: string;
  patient_uid: string;
  patient_name: string;
  patient_age: number | null;
  patient_sex: string | null;
  status: 'PENDING_CONFIRM' | 'RETURNED_FOR_CORRECTION';
  return_reason: string | null;
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
