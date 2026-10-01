/// <reference types="vitest/globals" />

import apiClient from '../../../lib/apiClient';
import { saveOverride } from '../api/resultReviewApi';

vi.mock('../../../lib/apiClient', () => ({
  default: { post: vi.fn(), get: vi.fn(), patch: vi.fn() },
}));

describe('saveOverride', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends "parameter", matching what the backend actually expects', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        id: 'o-1',
        result_id: 'r-1',
        parameter: 'erythrocytes',
        original_ai_value: 5,
        corrected_value: 8,
        rationale: 'Recount confirmed higher value',
        overridden_by: 'u-1',
        overridden_at: '2026-09-30T10:00:00Z',
      },
    });

    await saveOverride('r-1', 'erythrocytes', 8, 'Recount confirmed higher value', 5);

    expect(apiClient.post).toHaveBeenCalledWith('/results/r-1/override', {
      parameter: 'erythrocytes',
      corrected_value: 8,
      rationale: 'Recount confirmed higher value',
      original_ai_value: 5,
    });
  });
});
