import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { usePendingResults } from '../hooks/useResultReview';
import type { PendingResultItem } from '../types';
import { formatAge, formatTimestamp } from '../utils/format';
import { SkeletonRows } from './SkeletonRows';

const PAGE_SIZE = 20;

const urgencyConfig = {
  low:      { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  medium:   { dot: 'bg-amber-500',   text: 'text-amber-700'   },
  high:     { dot: 'bg-orange-500',  text: 'text-orange-700'  },
  critical: { dot: 'bg-rose-600',    text: 'text-rose-700'    },
  none:     { dot: 'bg-slate-300',   text: 'text-slate-400'   },
} as const;

function getWaiting(confirmedAt: string | null) {
  if (!confirmedAt) return { label: '—', ...urgencyConfig.none };
  const mins = Math.floor((Date.now() - new Date(confirmedAt).getTime()) / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const label = mins < 60 ? `${mins}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
  if (mins < 30)  return { label, ...urgencyConfig.low };
  if (mins < 120) return { label, ...urgencyConfig.medium };
  if (mins < 240) return { label, ...urgencyConfig.high };
  return { label, ...urgencyConfig.critical };
}

export function PendingApprovalQueueView() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, refetch } = usePendingResults(page, PAGE_SIZE);
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const showSkeleton = isLoading && !data;

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/dashboard/supervisor')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </button>

      {/* Header banner */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-amber-200 shadow-xs">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Pending Result Approvals</h1>
            <p className="mt-0.5 text-sm text-amber-700">
              {showSkeleton
                ? 'Loading queue…'
                : `${data?.total ?? 0} result${data?.total !== 1 ? 's' : ''} awaiting your sign-off — sorted oldest first`}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 h-9 text-xs font-semibold text-amber-700 hover:bg-amber-50 transition-colors disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load pending results. Please try refreshing.
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {['Patient', 'Sample ID', 'MedTech', 'Submitted', 'Waiting'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showSkeleton ? (
              <SkeletonRows cols={5} />
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <p className="font-semibold text-slate-800">All caught up!</p>
                    <p className="text-xs text-slate-400">No results are pending approval right now.</p>
                  </div>
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((row: PendingResultItem) => {
                const waiting = getWaiting(row.confirmed_at);
                return (
                  <tr
                    key={row.result_id}
                    onClick={() => navigate(`/supervisor/results/${row.result_id}`)}
                    className="cursor-pointer group hover:bg-amber-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                        {row.patient_uid || '—'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatAge(row.patient_age, row.patient_sex)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {row.specimen_id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{row.medtech_name || '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{formatTimestamp(row.confirmed_at)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${waiting.text}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${waiting.dot}`} />
                        {waiting.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-400">
            Page {page} of {totalPages} &middot; {data.total} total
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
