import type { ApiError } from '../../types/domain';

const NOTES_SECTION_SEPARATOR = '\n\n';

// The API takes one notes field, so the two free-text boxes are joined into it.
// A section the receptionist left empty is left out entirely — otherwise every
// request would be saved with a bare "Special Instructions:" label.
export function buildClinicalNotes(
  clinicalNotes: string,
  specialInstructions: string,
): string | undefined {
  const notes = clinicalNotes.trim();
  const special = specialInstructions.trim();
  const sections = [notes, special ? `Special Instructions:\n${special}` : ''].filter(Boolean);
  return sections.length > 0 ? sections.join(NOTES_SECTION_SEPARATOR) : undefined;
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
