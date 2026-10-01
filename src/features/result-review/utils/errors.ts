import type { ApiError } from '../../../types/domain';

const RESULT_NOT_FOUND_MESSAGE = 'This result could not be found. Please go back and try again.';
const INVALID_RESULT_STATUS_MESSAGE =
  "This result is no longer awaiting your decision — someone may have already acted on it. Please refresh.";

const APPROVE_MESSAGES: Record<string, string> = {
  RESULT_NOT_FOUND: RESULT_NOT_FOUND_MESSAGE,
  INVALID_RESULT_STATUS: INVALID_RESULT_STATUS_MESSAGE,
};

const RETURN_MESSAGES: Record<string, string> = {
  RESULT_NOT_FOUND: RESULT_NOT_FOUND_MESSAGE,
  INVALID_RESULT_STATUS: INVALID_RESULT_STATUS_MESSAGE,
};

const ESCALATE_MESSAGES: Record<string, string> = {
  RESULT_NOT_FOUND: RESULT_NOT_FOUND_MESSAGE,
  INVALID_RESULT_STATUS: INVALID_RESULT_STATUS_MESSAGE,
  INVALID_ESCALATION_PATH: 'That escalation pathway is not recognised. Please pick one from the list.',
};

const CONNECTION_ERROR = 'Could not reach the server. Please check your connection and try again.';

function resolve(error: ApiError, messages: Record<string, string>, generic: string): string {
  if (!error.response) return CONNECTION_ERROR;
  const code = error.response.data?.error?.code;
  return (code && messages[code]) ?? generic;
}

export function getApproveErrorMessage(error: ApiError): string {
  return resolve(error, APPROVE_MESSAGES, 'Failed to approve. Please try again.');
}

export function getReturnErrorMessage(error: ApiError): string {
  return resolve(error, RETURN_MESSAGES, 'Failed to return result. Please try again.');
}

export function getEscalateErrorMessage(error: ApiError): string {
  return resolve(error, ESCALATE_MESSAGES, 'Failed to escalate. Please try again.');
}
