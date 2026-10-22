import type { ApiError } from '../../../types/domain';

const RESULT_NOT_FOUND_MESSAGE = 'This result could not be found. Please go back and try again.';
const INVALID_RESULT_STATUS_MESSAGE =
  'This result is no longer awaiting your decision — someone may have already acted on it. Please refresh.';

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
  INVALID_ESCALATION_PATH:
    'That escalation pathway is not recognised. Please pick one from the list.',
};

const CONFIRM_MESSAGES: Record<string, string> = {
  RESULT_NOT_FOUND: RESULT_NOT_FOUND_MESSAGE,
};

const CONNECTION_ERROR = 'Could not reach the server. Please check your connection and try again.';

// The backend's standard error envelope always carries a human-written
// `message` for every error it raises (see main.py's exception handlers) —
// e.g. "Cannot confirm a result while an image retake is pending.", not
// just a bare code. A curated override in `messages` still wins when one
// exists (friendlier wording for a specific known code), but anything not
// explicitly enumerated now surfaces the server's own explanation instead
// of a one-size-fits-all string that tells the user nothing about why.
function backendMessage(error: ApiError): string | undefined {
  const msg = error.response?.data?.error?.message;
  if (typeof msg === 'string') return msg;
  if (msg && typeof msg === 'object') return msg.error?.message;
  return undefined;
}

function resolve(error: ApiError, messages: Record<string, string>, generic: string): string {
  if (!error.response) return CONNECTION_ERROR;
  const code = error.response.data?.error?.code;
  if (code && messages[code]) return messages[code];
  return backendMessage(error) ?? generic;
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

export function getConfirmErrorMessage(error: ApiError): string {
  return resolve(error, CONFIRM_MESSAGES, 'Failed to confirm. Please try again.');
}

export function getSaveAnnotationErrorMessage(error: ApiError): string {
  return resolve(error, {}, 'Failed to save your annotation. Please try again.');
}

export function getSaveOverrideErrorMessage(error: ApiError): string {
  return resolve(error, {}, 'Failed to save. Please try again.');
}
