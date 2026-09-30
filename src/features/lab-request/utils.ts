import type { ApiError } from '../../types/domain';

// clinicalNotes and specialInstructions are separate fields on the API —
// each is sent as its own field, or omitted if the receptionist left it blank.
export function trimmedOrUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

const SERVER_ERROR_MESSAGES: Record<string, string> = {
  PATIENT_NOT_FOUND:
    'That patient could not be found. Search for them again, or register them first.',
  VALIDATION_ERROR: 'Some details are missing or invalid. Please check the form and try again.',
};

const CONNECTION_ERROR = 'Could not reach the server. Please check your connection and try again.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

export function getLabRequestErrorMessage(error: ApiError): string {
  if (!error.response) return CONNECTION_ERROR;
  const code = error.response.data?.error?.code;
  return (code && SERVER_ERROR_MESSAGES[code]) ?? GENERIC_ERROR;
}
