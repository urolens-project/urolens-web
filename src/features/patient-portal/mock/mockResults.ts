import type { PatientResultSummary, PatientResultDetail } from '../types';

const PARTICLE_LABELS = [
  'bacteria',
  'crystals',
  'epithelial-cells',
  'erythrocytes',
  'leukocytes',
  'mucus-threads',
  'sperm-cells',
  'trichomonas-vaginalis',
  'urinary-casts',
  'yeast',
] as const;

function makeParticleCounts(overrides: Partial<Record<typeof PARTICLE_LABELS[number], number>> = {}) {
  return PARTICLE_LABELS.map((label) => ({
    label,
    count: (overrides as Record<string, number>)[label] ?? 0,
  }));
}

export const MOCK_RESULTS: PatientResultSummary[] = [
  {
    result_id: 'res-001',
    specimen_id: 'spc-001',
    status: 'RELEASED',
    released_at: '2025-05-10T08:30:00Z',
    created_at: '2025-05-08T10:00:00Z',
  },
  {
    result_id: 'res-002',
    specimen_id: 'spc-002',
    status: 'PENDING_SUPERVISOR_APPROVAL',
    released_at: null,
    created_at: '2025-05-14T09:15:00Z',
  },
  {
    result_id: 'res-003',
    specimen_id: 'spc-003',
    status: 'PENDING',
    released_at: null,
    created_at: '2025-05-18T14:00:00Z',
  },
];

export const MOCK_RESULT_DETAILS: Record<string, PatientResultDetail> = {
  'res-001': {
    result_id: 'res-001',
    specimen_id: 'spc-001',
    status: 'RELEASED',
    released_at: '2025-05-10T08:30:00Z',
    created_at: '2025-05-08T10:00:00Z',
    confirmed_at: '2025-05-09T15:45:00Z',
    particle_counts: makeParticleCounts({
      bacteria: 1,
      erythrocytes: 3,
      leukocytes: 8,
      'epithelial-cells': 2,
      'mucus-threads': 1,
    }),
    analyzed_by: 'Juan dela Cruz, RMT',
    confirmation_notes:
      'Mild pyuria noted with elevated WBC count. Findings are suggestive of a urinary tract infection. Clinical correlation is recommended.',
    smart_diagnosis_unavailable: false,
  },
  'res-002': {
    result_id: 'res-002',
    specimen_id: 'spc-002',
    status: 'PENDING_SUPERVISOR_APPROVAL',
    released_at: null,
    created_at: '2025-05-14T09:15:00Z',
    confirmed_at: '2025-05-14T11:00:00Z',
    particle_counts: makeParticleCounts({
      crystals: 2,
      erythrocytes: 1,
      leukocytes: 2,
      'epithelial-cells': 4,
    }),
    analyzed_by: 'Ana Reyes, RMT',
    confirmation_notes: null,
    smart_diagnosis_unavailable: true,
  },
  'res-003': {
    result_id: 'res-003',
    specimen_id: 'spc-003',
    status: 'PENDING',
    released_at: null,
    created_at: '2025-05-18T14:00:00Z',
    confirmed_at: null,
    particle_counts: makeParticleCounts(),
    analyzed_by: null,
    confirmation_notes: null,
    smart_diagnosis_unavailable: false,
  },
};
