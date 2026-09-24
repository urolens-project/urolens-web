/// <reference types="vitest/globals" />

import { buildClinicalNotes, getLabRequestErrorMessage } from '../utils';

describe('buildClinicalNotes', () => {
  it('sends nothing when both boxes are empty or whitespace', () => {
    expect(buildClinicalNotes('', '')).toBeUndefined();
    expect(buildClinicalNotes('   ', '\n')).toBeUndefined();
  });

  it('sends only the clinical notes when there are no special instructions', () => {
    expect(buildClinicalNotes('Dysuria for 3 days', '')).toBe('Dysuria for 3 days');
  });

  it('labels the special instructions when there are no clinical notes', () => {
    expect(buildClinicalNotes('', 'STAT')).toBe('Special Instructions:\nSTAT');
  });

  it('joins both sections and trims each', () => {
    expect(buildClinicalNotes('  Dysuria  ', ' Keep refrigerated ')).toBe(
      'Dysuria\n\nSpecial Instructions:\nKeep refrigerated',
    );
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
