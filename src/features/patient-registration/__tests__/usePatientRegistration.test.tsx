/// <reference types="vitest/globals" />

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreatePatient } from '../hooks/usePatientRegistration';
import { patientApi } from '../api/patientApi';
import type { PatientCreateRequest, PatientResponse } from '../types';

vi.mock('../api/patientApi', () => ({
  patientApi: {
    create: vi.fn(),
    search: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const mockResponse: PatientResponse = {
  patient_id: '1',
  patient_uid: 'PAT-000001',
  first_name: 'Juan',
  last_name: 'Dela Cruz',
  date_of_birth: '1990-01-01',
  contact_no: null,
  address: null,
  is_walkin: false,
  record_flag: null,
  created_at: '2026-01-01T00:00:00Z',
};

const mockPayload: PatientCreateRequest = {
  first_name: 'Juan',
  last_name: 'Dela Cruz',
  date_of_birth: '1990-01-01',
  contact_no: null,
  address: null,
  consent: {
    consent_given: true,
    consent_storage: true,
    consent_research: true,
  },
};

describe('useCreatePatient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls patientApi.create and returns patient data on success', async () => {
    vi.mocked(patientApi.create).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useCreatePatient(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(patientApi.create).toHaveBeenCalledWith(
      expect.objectContaining(mockPayload),
      expect.anything(),
    );
    expect(result.current.data).toEqual(mockResponse);
  });

  it('sets error state when patientApi.create fails', async () => {
    const error = {
      response: {
        data: {
          error: {
            code: 'DUPLICATE_PATIENT',
            message: 'A patient with this name already exists.',
          },
        },
      },
    };

    vi.mocked(patientApi.create).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useCreatePatient(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('invalidates patients query on success', async () => {
    vi.mocked(patientApi.create).mockResolvedValueOnce(mockResponse);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useCreatePatient(), { wrapper });

    result.current.mutate(mockPayload);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['patients'] });
  });
});
