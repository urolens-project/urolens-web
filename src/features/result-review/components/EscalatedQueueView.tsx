import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useEscalated } from '../hooks/useResultReview';
import type { EscalatedResultItem } from '../types';

const PAGE_SIZE = 20;

function formatAge(age: number | null, sex: string | null): string {
  const parts: string[] = [];
  if (age !== null) parts.push(`${age}y`);
  if (sex) parts.push(sex.charAt(0).toUpperCase() + sex.slice(1).toLowerCase());
  return parts.join(' / ') || '—';
}

function formatTimestamp(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const escalationChip: Record<string, { label: string; bg: string; text: string; border: string; dot: string }> = {
  NOTIFY_PHYSICIAN: {
    label: 'Notify Physician',
    bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500',
  },
  FLAG_SENIOR_REVIEW: {
    label: 'Senior Review',
    bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500',
  },
  MARK_CRITICAL: {
    label: 'Mark Critical',
    bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', dot: 'bg-rose-600',
  },
};

const fallbackChip = { label: '—', bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-300' };

function SkeletonRows({ cols }: { cols: number }) {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0">
          <td className="px-5 py-4">
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 rounded-md w-32" />
              <div className="h-2.5 bg-slate-100 rounded-md w-16" />
            </div>
          </td>
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <td key={j} className="px-5 py-4">
              <div className="h-3 bg-slate-100 rounded-md w-20" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function EscalatedQueueView() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, refetch } = useEscalated(page, PAGE_SIZE);
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
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-rose-200 shadow-xs">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Escalated Cases</h1>
            <p className="mt-0.5 text-sm text-rose-700">
              {showSkeleton
                ? 'Loading…'
                : `${data?.total ?? 0} case${data?.total !== 1 ? 's' : ''} flagged — requiring immediate attention`}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 h-9 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Error */}
      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load escalated cases. Please try refreshing.
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {['Patient', 'Sample ID', 'MedTech', 'Escalation Type', 'Escalated At'].map((h) => (
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
                      <ShieldAlert className="h-7 w-7 text-emerald-400" />
                    </div>
                    <p className="font-semibold text-slate-800">No active escalations</p>
                    <p className="text-xs text-slate-400">All escalated cases have been resolved.</p>
                  </div>
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((row: EscalatedResultItem) => {
                const chip = escalationChip[row.escalation_path] ?? fallbackChip;
                return (
                  <tr
                    key={row.result_id}
                    onClick={() => navigate(`/supervisor/results/${row.result_id}`)}
                    className="cursor-pointer group hover:bg-rose-50/40 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 group-hover:text-rose-700 transition-colors">
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
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${chip.bg} ${chip.text} ${chip.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${chip.dot}`} />
                        {chip.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">{formatTimestamp(row.escalated_at)}</td>
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
