// src/types/types.ts

/**
 * Payload contract for Patient Registration intake submission
 */
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

/**
 * Server response contract following successful patient registration
 */
export interface PatientRegistrationResponse {
  success: boolean;
  patient_id: string; 
  message: string;
  timestamp: string;
}

/**
 * Payload contract for Lab Request order encoding.
 * Supports both standard database relational mapping and manual text bypass entries.
 */
export interface LabRequestPayload {
  patient_id: string;
  physician_id?: string;   // Added to capture clean relational user_id UUIDs from the database
  physician_name?: string; // Used as the fallback name string when manual override is toggled active
  test_type: string;
  clinical_notes?: string;
}

/**
 * Server response contract following successful lab request encoding
 */
export interface LabRequestResponse {
  success: boolean;
  request_id: string; // Returns dynamic tracking reference sequence format: REQ-2026-XXXXX
  message: string;
  timestamp: string;
}