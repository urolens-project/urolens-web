/// <reference types="vitest/globals" />

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { PatientResultList } from '../components/PatientResultList';
import type { PatientResultSummary } from '../types';

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

const mockResults: PatientResultSummary[] = [
  {
    result_id: 'abc12345-6789',
    specimen_id: 'spec-001',
    status: 'RELEASED',
    released_at: '2026-05-20T10:00:00Z',
    created_at: '2026-05-15T08:00:00Z',
  },
  {
    result_id: 'def67890-1234',
    specimen_id: 'spec-002',
    status: 'PENDING',
    released_at: null,
    created_at: '2026-05-16T09:00:00Z',
  },
];

describe('PatientResultList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders result cards with shortened IDs', () => {
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    expect(screen.getByText('abc12345')).toBeInTheDocument();
    expect(screen.getByText('def67890')).toBeInTheDocument();
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

  it('navigates to detail page on View Details click', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    const viewDetailsButtons = screen.getAllByText('View Details');
    expect(viewDetailsButtons).toHaveLength(2);

    await user.click(viewDetailsButtons[0]);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/dashboard/patient/results/abc12345-6789'
    );
  });

  it('navigates to detail page on card click', () => {
    render(
      <MemoryRouter>
        <PatientResultList results={mockResults} />
      </MemoryRouter>
    );
    const cards = screen.getAllByRole('button');
    fireEvent.click(cards[0]);
    expect(mockNavigate).toHaveBeenCalledWith(
      '/dashboard/patient/results/abc12345-6789'
    );
  });
});
