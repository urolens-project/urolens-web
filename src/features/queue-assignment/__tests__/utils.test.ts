/// <reference types="vitest/globals" />

import { formatTestType } from '../utils';

describe('formatTestType', () => {
  it('replaces underscores with spaces', () => {
    expect(formatTestType('URINALYSIS_-_ROUTINE')).toBe('URINALYSIS - ROUTINE');
  });

  it('leaves an already-readable value unchanged', () => {
    expect(formatTestType('Urinalysis - Complete Suite')).toBe('Urinalysis - Complete Suite');
  });
});
