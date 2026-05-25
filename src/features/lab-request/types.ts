export interface PatientSearchResult {
  patient_id: string;
  patient_uid: string;
  first_name: string;
  last_name: string;
}

export interface Physician {
  user_id: string;
  name: string;
}
