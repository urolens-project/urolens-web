/// <reference types="vitest/globals" />

import { trimmedOrUndefined, getLabRequestErrorMessage } from '../utils';

describe('trimmedOrUndefined', () => {
  it('sends nothing when the box is empty or whitespace', () => {
    expect(trimmedOrUndefined('')).toBeUndefined();
    expect(trimmedOrUndefined('   \n ')).toBeUndefined();
  });

  it('sends the trimmed text otherwise', () => {
    expect(trimmedOrUndefined('  Dysuria for 3 days  ')).toBe('Dysuria for 3 days');
  });
});

describe('getLabRequestErrorMessage', () => {
  it('explains a patient that could not be found', () => {
    const message = getLabRequestErrorMessage({
      response: { data: { error: { code: 'PATIENT_NOT_FOUND' } } },
    });
    expect(message).toMatch(/could not be found/i);
  });

  it('explains a validation failure', () => {
    const message = getLabRequestErrorMessage({
      response: { data: { error: { code: 'VALIDATION_ERROR' } } },
    });
    expect(message).toMatch(/missing or invalid/i);
  });

  it('reports a lost connection when there was no response', () => {
    expect(getLabRequestErrorMessage({ message: 'Network Error' })).toMatch(/could not reach/i);
  });

  it('falls back to a generic message for unknown server errors', () => {
    const message = getLabRequestErrorMessage({
      response: { data: { error: { code: 'SOMETHING_ELSE' } } },
    });
    expect(message).toBe('Something went wrong. Please try again.');
  });
});
