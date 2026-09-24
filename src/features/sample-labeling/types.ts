export interface ReceivedSpecimenResult {
  specimen_id: string;
  sample_uid: string | null;
  patient_name: string;
  patient_uid: string | null;
  test_type: string | null;
  status: string;
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
