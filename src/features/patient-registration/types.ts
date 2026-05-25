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
}
