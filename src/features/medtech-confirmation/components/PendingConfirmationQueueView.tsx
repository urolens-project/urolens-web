import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, ClipboardList, RefreshCw, RotateCcw } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useMedtechPending } from '../hooks/useMedtechConfirmation';
import { formatAge } from '../../result-review/utils/format';
import { SkeletonRows } from '../../result-review/components/SkeletonRows';
import type { MedtechPendingItem } from '../types';

const PAGE_SIZE = 20;

export function PendingConfirmationQueueView() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, refetch } = useMedtechPending(page, PAGE_SIZE);
  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;
  const showSkeleton = isLoading && !data;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header banner */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-200 bg-blue-50 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-blue-200 shadow-xs">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Results Awaiting Confirmation</h1>
            <p className="mt-0.5 text-sm text-blue-700">
              {showSkeleton
                ? 'Loading queue…'
                : `${data?.total ?? 0} result${data?.total !== 1 ? 's' : ''} need your review`}
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-white px-3 h-9 text-xs font-semibold text-blue-700 hover:bg-blue-50 transition-colors disabled:opacity-60 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load your confirmation queue. Please try refreshing.
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {['Patient', 'Sample ID', 'Status', 'Note'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {showSkeleton ? (
              <SkeletonRows cols={4} />
            ) : data?.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50">
                      <CheckCircle2 className="h-7 w-7 text-emerald-400" />
                    </div>
                    <p className="font-semibold text-slate-800">All caught up!</p>
                    <p className="text-xs text-slate-400">Nothing is waiting on your confirmation right now.</p>
                  </div>
                </td>
              </tr>
            ) : (
              (data?.items ?? []).map((row: MedtechPendingItem) => {
                const returned = row.status === 'RETURNED_FOR_CORRECTION';
                return (
                  <tr
                    key={row.result_id}
                    onClick={() =>
                      navigate(`/medtech/results/${row.result_id}`, {
                        state: { returnReason: row.return_reason },
                      })
                    }
                    className="cursor-pointer group hover:bg-blue-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {row.patient_uid || '—'}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatAge(row.patient_age, row.patient_sex)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {row.specimen_id.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {returned ? (
                        <Badge variant="warning" className="inline-flex items-center gap-1">
                          <RotateCcw className="h-3 w-3" /> Returned
                        </Badge>
                      ) : (
                        <Badge variant="default">Pending Confirm</Badge>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                      {row.return_reason || '—'}
                    </td>
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
