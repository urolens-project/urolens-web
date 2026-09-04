import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { fetchSupervisorStats } from '../features/result-review/api/resultReviewApi';
import type { SupervisorStats } from '../features/result-review/types';

type LabStats = SupervisorStats;

function greetingForHour(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function SupervisorDashboard() {
  const navigate = useNavigate();
  const greeting = greetingForHour(new Date().getHours());

  // 2. Set up states for your data and loading conditions
  const [stats, setStats] = useState<LabStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Dynamic Data Fetching Hook
  useEffect(() => {
    let isMounted = true;

    async function fetchLiveDashboardStats() {
      try {
        setIsLoading(true);
        
        const data = await fetchSupervisorStats();

        if (isMounted) {
          setStats(data);
          setError(null);
        }
      } catch {
        if (isMounted) setError('Failed to refresh system metrics.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchLiveDashboardStats();

    // Optional: Set up a polling interval to auto-refresh data every 30 seconds
    const interval = setInterval(fetchLiveDashboardStats, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // 4. Map the dynamic data safely to your card layout configurations
  const statCards = [
    {
      label: 'Pending Approval',
      value: stats?.pendingCount ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50/60',
      border: 'border-amber-100',
      accent: 'bg-amber-600',
      href: '/supervisor/results',
    },
    {
      label: 'Approved Today',
      value: stats?.approvedToday ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50/60',
      border: 'border-emerald-100',
      accent: 'bg-emerald-600',
      href: '/supervisor/results/approved',
    },
    {
      label: 'Escalated Cases',
      value: stats?.escalatedCount ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50/60',
      border: 'border-rose-100',
      accent: 'bg-rose-600',
      href: '/supervisor/results/escalated',
    },
  ];

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/60 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{greeting}, Supervisor</h2>
          <p className="mt-1 text-sm text-slate-500">Real-time status monitor for the laboratory validation queue.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg w-fit">
          <span className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-400' : 'bg-emerald-500'} ${isLoading ? 'animate-pulse' : ''}`} />
          {isLoading ? 'Syncing...' : 'Live Console Connection'}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              role="button"
              tabIndex={0}
              onClick={() => navigate(card.href)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(card.href)}
              className={`group relative overflow-hidden rounded-2xl border ${card.border} ${card.bg} p-6 flex items-center gap-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}
            >
              <div className={`absolute top-0 left-0 right-0 h-[0.75px] ${card.accent}`} />
              
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-xs">
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>

              <div className="min-w-0 flex-1">
                {/* 5. Clean Skeleton UI Loading State */}
                {isLoading && !stats ? (
                  <div className="h-9 w-16 bg-slate-200/80 animate-pulse rounded-lg mt-0.5" />
                ) : (
                  <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </p>
                )}
                <p className="text-xs font-semibold text-slate-500 tracking-wide mt-1 uppercase">
                  {card.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action panel */}
      <div className="space-y-4">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Prioritized Workspaces</p>
        <button
          onClick={() => navigate('/supervisor/results')}
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 text-left hover:border-emerald-500 hover:shadow-lg transition-all duration-300 cursor-pointer w-full"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 group-hover:bg-emerald-600 transition-colors">
              <ClipboardList className="h-5 w-5 text-emerald-600 group-hover:text-white transition-colors" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                Open Result Approvals Queue
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Review verified technical inputs, sign off clinical assays, or trigger re-testing pipelines for pending diagnostics.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all self-end sm:self-center">
            Enter Queue <ArrowRight className="h-4 w-4" />
          </div>
        </button>
      </div>
    </div>
  );
}