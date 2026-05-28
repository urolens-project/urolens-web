/// <reference types="vitest/globals" />

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PatientResultList } from '../components/PatientResultList';
import type { PatientResultItem } from '../types';

const { mockNavigate } = vi.hoisted(() => {
  const fn = vi.fn();
  return { mockNavigate: fn };
});

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockResults: PatientResultItem[] = [
  {
    result_id: 'abc12345-6789',
    test_type: 'Urinalysis',
    status: 'RELEASED',
    released_at: '2026-05-20T10:00:00Z',
  },
  {
    result_id: 'def67890-1234',
    test_type: 'Urinalysis',
    status: 'PENDING',
    released_at: null,
  },
];

describe('PatientResultList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders test type for each result', () => {
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    const labels = screen.getAllByText('Urinalysis');
    expect(labels.length).toBeGreaterThanOrEqual(2);
  });

  it('renders status chips for each result', () => {
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    expect(screen.getByText('Released')).toBeInTheDocument();
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('shows release date for RELEASED results', () => {
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Released: May 20, 2026/)).toBeInTheDocument();
  });

  it('shows Not yet released for non-RELEASED results', () => {
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    expect(screen.getByText('Not yet released')).toBeInTheDocument();
  });

  it('shows empty state when no results', () => {
    render(
      <MemoryRouter>
        <PatientResultList results={[]} />
      </MemoryRouter>
    );
    expect(screen.getByText('You have no lab results yet.')).toBeInTheDocument();
  });

  it('renders View Details only for RELEASED results', () => {
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    const viewDetailsButtons = screen.getAllByText('View Details');
    expect(viewDetailsButtons).toHaveLength(1);
  });

  it('navigates to detail page when RELEASED result is clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    await user.click(screen.getByText('View Details'));
    expect(mockNavigate).toHaveBeenCalledWith(
      '/dashboard/patient/results/abc12345-6789'
    );
  });

  it('does not navigate when a PENDING result card is clicked', () => {
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    // PENDING card has no role="button"
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(1); // only the RELEASED card
  });
});
