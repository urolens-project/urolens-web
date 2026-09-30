import type { ApiError } from '../../types/domain';

const SERVER_ERROR_MESSAGES: Record<string, string> = {
  SPECIMEN_NOT_FOUND: 'That specimen could not be found. Search for it again.',
  SPECIMEN_NOT_RECEIVED:
    'This specimen has not been received yet, or has already been labeled. Search for it again.',
  PATIENT_NAME_DECRYPTION_FAILED:
    'The label could not be generated because the patient name could not be read. Please contact your administrator.',
  LABEL_NOT_FOUND:
    'No label has been generated for this specimen yet. Generate the label first, or tick "Printer Offline".',
};

const CONNECTION_ERROR = 'Could not reach the server. Please check your connection and try again.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

export function getLabelErrorMessage(error: ApiError): string {
  if (!error.response) return CONNECTION_ERROR;
  const code = error.response.data?.error?.code;
  return (code && SERVER_ERROR_MESSAGES[code]) ?? GENERIC_ERROR;
}

export function formatTestType(testType: string | null): string {
  return testType ? testType.replace(/_/g, ' ') : 'Not specified';
}
