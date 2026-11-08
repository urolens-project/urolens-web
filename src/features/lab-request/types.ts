// Deliberately slim — matches the backend's PatientSearchItem (RA 10173 data
// minimization): a name/DOB match is enough to find someone, but a broad
// substring search shouldn't hand back everyone's full decrypted record.
export interface PatientSearchResult {
  patient_id: string;
  patient_uid: string;
}

export interface Physician {
  user_id: string;
  username: string;
}
