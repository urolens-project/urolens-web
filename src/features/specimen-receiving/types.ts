export interface LabRequestSearchResult {
  lab_request_id: string;
  request_uid: string;
  test_type: string;
  physician_name: string;
  patient_id: string;
  // null only if the patient row is missing (shouldn't happen given the FK).
  patient_uid: string | null;
  patient_name: string | null;
}

// Router state passed from the Lab Request confirmation screen, so the specimen
// receiving step opens with that request already selected.
export interface ReceiveHandoffState {
  labRequest?: LabRequestSearchResult;
}

// Router state passed to the Sample Labeling step after a specimen is received.
export interface LabelHandoffState {
  specimen: {
    specimen_id: string;
    sample_uid: string;
    lab_request_id: string;
    request_uid: string;
    test_type: string;
    patient_uid: string | null;
  };
}
