import type { PatientResultSummary, PatientResultDetail } from '../types';

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
    cell_counts: {
      rbc: 3,
      wbc: 8,
      epithelial_cells: 2,
      casts: 0,
      bacteria: 1,
      crystals: 0,
      mucus_threads: 1,
    },
    interpretation:
      'Mild pyuria noted with elevated WBC count. Findings are suggestive of a urinary tract infection. Clinical correlation is recommended. No casts or crystals observed.',
    medtech_name: 'Juan dela Cruz, RMT',
    pathologist_name: 'Dr. Maria Santos',
    pathologist_license: 'PRC-PATH-12345',
  },
  'res-002': {
    result_id: 'res-002',
    specimen_id: 'spc-002',
    status: 'PENDING_SUPERVISOR_APPROVAL',
    released_at: null,
    created_at: '2025-05-14T09:15:00Z',
    confirmed_at: '2025-05-14T11:00:00Z',
    cell_counts: {
      rbc: 1,
      wbc: 2,
      epithelial_cells: 4,
      casts: 0,
      bacteria: 0,
      crystals: 2,
      mucus_threads: 0,
    },
    interpretation: null,
    medtech_name: 'Ana Reyes, RMT',
    pathologist_name: null,
    pathologist_license: null,
  },
  'res-003': {
    result_id: 'res-003',
    specimen_id: 'spc-003',
    status: 'PENDING',
    released_at: null,
    created_at: '2025-05-18T14:00:00Z',
    confirmed_at: null,
    cell_counts: null,
    interpretation: null,
    medtech_name: null,
    pathologist_name: null,
    pathologist_license: null,
  },
};
