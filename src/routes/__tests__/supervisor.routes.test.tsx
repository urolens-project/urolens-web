/// <reference types="vitest/globals" />

import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SupervisorDashboard from '../supervisor.routes';
import { fetchSupervisorStats } from '../../features/result-review/api/resultReviewApi';

vi.mock('../../features/result-review/api/resultReviewApi', () => ({
  fetchSupervisorStats: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const stats = { pending_count: 4, approved_today: 9, escalated_count: 2 };

function renderDashboard() {
  return render(
    <MemoryRouter>
      <SupervisorDashboard />
    </MemoryRouter>,
  );
}

describe('SupervisorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('greets the Supervisor according to the time of day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-30T08:00:00'));
    vi.mocked(fetchSupervisorStats).mockResolvedValue(stats);
    renderDashboard();

    expect(await screen.findByText(/Good morning, Supervisor/i)).toBeInTheDocument();
  });

  it('shows an afternoon greeting later in the day', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-30T14:00:00'));
    vi.mocked(fetchSupervisorStats).mockResolvedValue(stats);
    renderDashboard();

    expect(await screen.findByText(/Good afternoon, Supervisor/i)).toBeInTheDocument();
  });

  it('shows an evening greeting at night', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-30T20:00:00'));
    vi.mocked(fetchSupervisorStats).mockResolvedValue(stats);
    renderDashboard();

    expect(await screen.findByText(/Good evening, Supervisor/i)).toBeInTheDocument();
  });

  it('shows the live counts once loaded', async () => {
    vi.mocked(fetchSupervisorStats).mockResolvedValue(stats);
    renderDashboard();

    expect(await screen.findByText('4')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows an error message when the counts fail to load', async () => {
    vi.mocked(fetchSupervisorStats).mockRejectedValue(new Error('network down'));
    renderDashboard();

    expect(await screen.findByText(/couldn't be refreshed|Failed to refresh/i)).toBeInTheDocument();
  });

  it('refreshes the counts automatically without a manual reload', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.mocked(fetchSupervisorStats)
      .mockResolvedValueOnce(stats)
      .mockResolvedValueOnce({ pending_count: 7, approved_today: 9, escalated_count: 2 });
    renderDashboard();

    await waitFor(() => expect(fetchSupervisorStats).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(30_000);
    await waitFor(() => expect(fetchSupervisorStats).toHaveBeenCalledTimes(2));
    expect(await screen.findByText('7')).toBeInTheDocument();
  });

  it('takes the Supervisor to the Pending Approval queue from its card', async () => {
    vi.mocked(fetchSupervisorStats).mockResolvedValue(stats);
    renderDashboard();

    (await screen.findByText('Pending Approval')).closest('[role="button"]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/supervisor/results');
  });

  it('takes the Supervisor to the Approved Today queue from its card', async () => {
    vi.mocked(fetchSupervisorStats).mockResolvedValue(stats);
    renderDashboard();

    (await screen.findByText('Approved Today')).closest('[role="button"]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/supervisor/results/approved');
  });

  it('takes the Supervisor to the Escalated queue from its card', async () => {
    vi.mocked(fetchSupervisorStats).mockResolvedValue(stats);
    renderDashboard();

    (await screen.findByText('Escalated Cases')).closest('[role="button"]')?.dispatchEvent(
      new MouseEvent('click', { bubbles: true }),
    );
    expect(mockNavigate).toHaveBeenCalledWith('/supervisor/results/escalated');
  });

  it('offers a dedicated action prompt into the Pending Approval queue', async () => {
    vi.mocked(fetchSupervisorStats).mockResolvedValue(stats);
    renderDashboard();

    const prompt = await screen.findByRole('button', { name: /Open Result Approvals Queue/i });
    prompt.click();
    expect(mockNavigate).toHaveBeenCalledWith('/supervisor/results');
  });
});
