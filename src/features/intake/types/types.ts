export interface PatientRegistrationPayload {
  first_name: string;
  middle_name?: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  contact_number: string;
  complete_address: string;
  is_walkin: boolean;
  emergency_name?: string;
  emergency_relationship?: string;
  emergency_phone?: string;
}

export interface PatientRegistrationResponse {
  success: boolean;
  patient_id: string; // Dynamic identifier string format: URLNS-2026-XXXXX
  message: string;
  timestamp: string;
}