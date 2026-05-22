import axios from 'axios';
import type { LabRequestPayload, LabRequestResponse } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const labRequestsApi = {
  createRequest: async (payload: LabRequestPayload): Promise<LabRequestResponse> => {
    const response = await axios.post<LabRequestResponse>(
      `${API_BASE_URL}/api/v1/lab-requests`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  },
};