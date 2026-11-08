export type PatientSex = 'MALE' | 'FEMALE' | 'OTHER';

export interface ConsentData {
  consent_given: boolean;
  consent_storage: boolean;
  consent_research: boolean;
}

export interface PatientCreateRequest {
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  date_of_birth: string;
  sex: PatientSex;
  contact_no?: string | null;
  address?: string | null;
  is_walkin?: boolean;
  consent: ConsentData;
}

// Deliberately slim — matches the backend's PatientSearchItem (RA 10173 data
// minimization): the full decrypted record isn't returned for a broad
// name-substring search, only enough to identify and select a patient.
export interface PatientSearchItem {
  patient_id: string;
  patient_uid: string;
}

export interface PatientResponse {
  patient_id: string;
  patient_uid: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  sex: PatientSex;
  contact_no: string | null;
  address: string | null;
  is_walkin: boolean;
  record_flag: string;
  created_at: string;
  // Only populated on the create response — the one-time plaintext password
  // isn't re-derivable afterward, so this is the receptionist's only chance
  // to see and hand it to the patient.
  portal_username: string | null;
  portal_password: string | null;
}
