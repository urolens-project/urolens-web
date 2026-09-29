// No patient_name — the backend dropped it from this search response
// (RA 10173 data-minimization). The label preview still carries it once a
// specimen is selected and a label is generated.
export interface ReceivedSpecimenResult {
  specimen_id: string;
  sample_uid: string | null;
  patient_uid: string | null;
  test_type: string | null;
  status: string;
  label_count: number;
}

// Router state passed to the Queue Assignment step after a label is confirmed.
export interface QueueHandoffState {
  specimen: {
    specimen_id: string;
    sample_uid: string | null;
    patient_uid: string | null;
    test_type: string | null;
  };
}
