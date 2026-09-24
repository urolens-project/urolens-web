import type { ApiError } from '../../types/domain';

const SERVER_ERROR_MESSAGES: Record<string, string> = {
  LAB_REQUEST_NOT_FOUND:
    'That lab request could not be found. Search for it again, or create it first.',
  REJECTION_REASON_REQUIRED: 'Please select a reason for rejecting this specimen.',
  INVALID_REJECTION_REASON:
    'That rejection reason is not recognised. Please pick one from the list.',
  SPECIMEN_ALREADY_RECEIVED: 'A specimen was already received for this lab request.',
};

const CONNECTION_ERROR = 'Could not reach the server. Please check your connection and try again.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

export function getReceiveErrorMessage(error: ApiError): string {
  if (!error.response) return CONNECTION_ERROR;
  const code = error.response.data?.error?.code;
  return (code && SERVER_ERROR_MESSAGES[code]) ?? GENERIC_ERROR;
}
