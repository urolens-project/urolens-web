import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ChevronLeft, ChevronRight, ClipboardCheck, FlaskConical, RefreshCw,
} from 'lucide-react';
import { useMyResults } from '../hooks/usePhysician';
import type { PhysicianResultSummary } from '../types';
import { Button } from '../../../components/ui/Button';

const PAGE_SIZE = 20;

const STATUS_CHIP: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  APPROVED: { label: 'Approved', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  PENDING_SUPERVISOR_APPROVAL: { label: 'Under Review', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  PENDING_CONFIRM: { label: 'Pending Confirm', bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  RETURNED_FOR_CORRECTION: { label: 'Returned', bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' },
  CRITICAL_ESCALATED: { label: 'Escalated', bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
};

const fallbackChip = { label: 'Unknown', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-300' };

function formatAge(age: number | null, sex: string | null): string {
  const parts: string[] = [];
  if (age !== null) parts.push(`${age}y`);
  if (sex) parts.push(sex.charAt(0).toUpperCase() + sex.slice(1).toLowerCase());
  return parts.join(' / ') || '—';
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-slate-100 last:border-0">
          <td className="px-5 py-4">
            <div className="space-y-2">
              <div className="h-3.5 bg-slate-100 rounded-md w-36" />
              <div className="h-2.5 bg-slate-100 rounded-md w-20" />
            </div>
          </td>
          {[24, 28, 20, 28].map((w, j) => (
            <td key={j} className="px-5 py-4">
              <div className={`h-3 bg-slate-100 rounded-md w-${w}`} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function MyResultsList() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, refetch } = useMyResults(page, PAGE_SIZE);
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const showSkeleton = isLoading && !data;

  return (
    <div className="space-y-6 max-w-6xl">
      <button
        onClick={() => navigate('/dashboard/physician')}
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Dashboard
      </button>

      <div className="flex items-center justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-indigo-200 shadow-xs">
            <ClipboardCheck className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Patients' Results</h1>
            <p className="mt-0.5 text-sm text-indigo-700">
              {showSkeleton
                ? 'Loading…'
                : `${data?.total ?? 0} result${data?.total !== 1 ? 's' : ''} for patients under your requests`}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-white px-3 h-9 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load results. Please try refreshing.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {['Patient', 'Sample ID', 'Status', 'Confirmed At', 'Requested On'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showSkeleton ? (
              <SkeletonRows />
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                      <FlaskConical className="h-7 w-7 text-slate-300" />
                    </div>
                    <p className="font-semibold text-slate-800">No results yet</p>
                    <p className="text-xs text-slate-400">
                      Results for your lab requests will appear here once processed.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((row: PhysicianResultSummary) => {
                const chip = STATUS_CHIP[row.status] ?? fallbackChip;
                return (
                  <tr
                    key={row.result_id}
                    onClick={() => navigate(`/physician/results/${row.result_id}`)}
                    className="cursor-pointer group hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">
                        {row.patient_name || '—'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {row.patient_uid} · {formatAge(row.patient_age, row.patient_sex)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {row.specimen_id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${chip.bg} ${chip.text} border border-transparent`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${chip.dot}`} />
                        {chip.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{formatDate(row.confirmed_at)}</td>
                    <td className="px-5 py-4 text-xs text-slate-400">{formatDate(row.created_at)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

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
