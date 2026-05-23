import axios from 'axios';
import type { PatientRegistrationPayload, PatientRegistrationResponse } from '../types/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export const intakeApi = {
  registerPatient: async (payload: PatientRegistrationPayload): Promise<PatientRegistrationResponse> => {
    const response = await axios.post<PatientRegistrationResponse>(
      `${API_BASE_URL}/intake/patients`, 
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