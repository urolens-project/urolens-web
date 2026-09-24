export interface LabRequestSearchResult {
  lab_request_id: string;
  request_uid: string;
  test_type: string;
  physician_name: string;
  patient_id: string;
}

// Router state passed from the Lab Request confirmation screen, so the specimen
// receiving step opens with that request already selected.
export interface ReceiveHandoffState {
  labRequest?: LabRequestSearchResult;
}
