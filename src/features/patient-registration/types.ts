export interface ConsentData {
  consent_given: boolean;
  consent_storage: boolean;
  consent_research: boolean;
}

export interface PatientCreateRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_no: string | null;
  address: string | null;
  consent: ConsentData;
}

export interface PatientResponse {
  patient_id: string;
  patient_uid: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  contact_no: string | null;
  address: string | null;
  is_walkin: boolean;
  record_flag: string | null;
  created_at: string;
}
