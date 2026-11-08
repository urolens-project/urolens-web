/// <reference types="vitest/globals" />

import {
  getApproveErrorMessage,
  getReturnErrorMessage,
  getEscalateErrorMessage,
} from '../utils/errors';

describe('getApproveErrorMessage', () => {
  it('explains a result that could not be found', () => {
    expect(
      getApproveErrorMessage({ response: { data: { error: { code: 'RESULT_NOT_FOUND' } } } }),
    ).toMatch(/could not be found/i);
  });

  it('explains a race with another decision on the same result', () => {
    expect(
      getApproveErrorMessage({ response: { data: { error: { code: 'INVALID_RESULT_STATUS' } } } }),
    ).toMatch(/already acted on it/i);
  });

  it('reports a lost connection when there was no response', () => {
    expect(getApproveErrorMessage({ message: 'Network Error' })).toMatch(/could not reach/i);
  });

  it('falls back to a generic message for an unmapped code', () => {
    expect(
      getApproveErrorMessage({ response: { data: { error: { code: 'SOMETHING_ELSE' } } } }),
    ).toBe('Failed to approve. Please try again.');
  });
});

describe('getReturnErrorMessage', () => {
  it('explains a race with another decision on the same result', () => {
    expect(
      getReturnErrorMessage({ response: { data: { error: { code: 'INVALID_RESULT_STATUS' } } } }),
    ).toMatch(/already acted on it/i);
  });

  it('falls back to a generic message for an unmapped code', () => {
    expect(
      getReturnErrorMessage({ response: { data: { error: { code: 'SOMETHING_ELSE' } } } }),
    ).toBe('Failed to return result. Please try again.');
  });
});

describe('getEscalateErrorMessage', () => {
  it('explains an invalid escalation pathway', () => {
    expect(
      getEscalateErrorMessage({ response: { data: { error: { code: 'INVALID_ESCALATION_PATH' } } } }),
    ).toMatch(/not recognised/i);
  });

  it('explains a race with another decision on the same result', () => {
    expect(
      getEscalateErrorMessage({ response: { data: { error: { code: 'INVALID_RESULT_STATUS' } } } }),
    ).toMatch(/already acted on it/i);
  });

  it('falls back to a generic message for an unmapped code', () => {
    expect(
      getEscalateErrorMessage({ response: { data: { error: { code: 'SOMETHING_ELSE' } } } }),
    ).toBe('Failed to escalate. Please try again.');
  });
});
