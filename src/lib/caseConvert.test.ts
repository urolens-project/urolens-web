/// <reference types="vitest/globals" />

import { keysToCamel, keysToSnake } from './caseConvert';

describe('keysToCamel (outbound: snake_case -> camelCase)', () => {
  it('converts a flat object', () => {
    expect(keysToCamel({ first_name: 'Juan', last_name: 'Dela Cruz' })).toEqual({
      firstName: 'Juan',
      lastName: 'Dela Cruz',
    });
  });

  it('converts nested objects and arrays of objects', () => {
    expect(
      keysToCamel({
        patient_uid: 'PAT-000001',
        consent: { consent_given: true, consent_storage: true },
        lab_requests: [{ test_type: 'URINALYSIS' }, { test_type: 'CBC' }],
      }),
    ).toEqual({
      patientUid: 'PAT-000001',
      consent: { consentGiven: true, consentStorage: true },
      labRequests: [{ testType: 'URINALYSIS' }, { testType: 'CBC' }],
    });
  });

  it('leaves single-word keys with no separator unchanged', () => {
    expect(keysToCamel({ status: 'PENDING', weighted_score: 0.8 })).toEqual({
      status: 'PENDING',
      weightedScore: 0.8,
    });
  });

  it('leaves null, primitives, and Dates inside a structure untouched', () => {
    const date = new Date('2026-09-30T00:00:00Z');
    expect(keysToCamel({ approved_at: date, notes: null, count: 3 })).toEqual({
      approvedAt: date,
      notes: null,
      count: 3,
    });
  });

  it('passes a top-level FormData instance through untouched, for file uploads', () => {
    const formData = new FormData();
    formData.append('file', new File(['data'], 'image.png', { type: 'image/png' }));
    formData.append('specimen_id', 'sp-1');

    const result = keysToCamel(formData);

    expect(result).toBe(formData);
    expect(result.get('specimen_id')).toBe('sp-1');
  });

  it('does not walk into a File/Blob nested inside an object', () => {
    const file = new File(['data'], 'image.png', { type: 'image/png' });
    const result = keysToCamel({ image_file: file, patient_id: 'p-1' });

    expect(result).toEqual({ imageFile: file, patientId: 'p-1' });
    // toEqual would pass on a deep-equal copy too; toBe confirms it's the
    // same File instance, not a walked/cloned one.
    expect((result as unknown as { imageFile: File }).imageFile).toBe(file);
  });
});

describe('keysToSnake (inbound: camelCase -> snake_case)', () => {
  it('converts a flat object', () => {
    expect(keysToSnake({ patientUid: 'PAT-000001', sampleUid: 'SMP-1' })).toEqual({
      patient_uid: 'PAT-000001',
      sample_uid: 'SMP-1',
    });
  });

  it('converts nested objects and arrays of objects', () => {
    expect(
      keysToSnake({
        data: [{ resultId: 'r-1', patientUid: 'PAT-1' }],
        pagination: { nextCursor: null, hasMore: false },
      }),
    ).toEqual({
      data: [{ result_id: 'r-1', patient_uid: 'PAT-1' }],
      pagination: { next_cursor: null, has_more: false },
    });
  });

  // Regression coverage for the acronym-splitting bug: the old
  // /([A-Z])/g regex inserted an underscore before every capital letter
  // individually, so a run of capitals got split letter-by-letter.
  it('keeps a run of capitals together instead of splitting it letter by letter', () => {
    expect(keysToSnake({ RBC: 5 })).toEqual({ rbc: 5 });
  });

  it('does not put an underscore before every letter of an acronym mid-key', () => {
    expect(keysToSnake({ userID: 'u-1' })).toEqual({ user_id: 'u-1' });
  });

  it('does not add a leading underscore when the key starts with a capital', () => {
    expect(keysToSnake({ Bacteria: 3 })).toEqual({ bacteria: 3 });
  });

  it('handles a realistic particle-class payload with mixed-case keys', () => {
    expect(
      keysToSnake({
        particleClasses: { RBC: 5, WBC: 3, bacteria: 10, epithelialCells: 1 },
      }),
    ).toEqual({
      particle_classes: { rbc: 5, wbc: 3, bacteria: 10, epithelial_cells: 1 },
    });
  });

  it('leaves null, primitives, and Dates inside a structure untouched', () => {
    const date = new Date('2026-09-30T00:00:00Z');
    expect(keysToSnake({ releasedAt: date, notes: null, count: 3 })).toEqual({
      released_at: date,
      notes: null,
      count: 3,
    });
  });

  it('does not walk into a Blob nested inside a response-shaped object', () => {
    const blob = new Blob(['data'], { type: 'application/pdf' });
    const result = keysToSnake({ reportFile: blob, resultId: 'r-1' });

    expect(result).toEqual({ report_file: blob, result_id: 'r-1' });
    // toEqual would pass on a deep-equal copy too; toBe confirms it's the
    // same Blob instance, not a walked/cloned one.
    expect((result as unknown as { report_file: Blob }).report_file).toBe(blob);
  });
});
