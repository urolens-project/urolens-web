import { useState } from 'react';
import { CheckCircle, RefreshCw, Send, FlaskConical } from 'lucide-react';
import { useApprovedResults, useReleaseResult } from '../hooks/useResultReleasing';
import { ReleaseConfirmationModal } from './ReleaseConfirmationModal';
import type { ApprovedResultItem, ReleaseMethod } from '../types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ApprovedResultsQueue() {
  const [cursor, setCursor] = useState<string | undefined>();
  const [selectedResult, setSelectedResult] = useState<ApprovedResultItem | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<ReleaseMethod | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, isFetching, isError, refetch } = useApprovedResults(20, cursor);
  const releaseMutation = useReleaseResult();

  function handleOpenModal(result: ApprovedResultItem) {
    setSelectedResult(result);
    setSelectedMethod(null);
    setModalOpen(true);
  }

  function handleConfirm(method: ReleaseMethod) {
    if (!selectedResult) return;
    releaseMutation.mutate(
      { resultId: selectedResult.result_id, releaseMethod: method },
      {
        onSuccess: () => {
          setModalOpen(false);
          setSelectedResult(null);
          setSelectedMethod(null);
        },
        onError: () => {
          setModalOpen(false);
        },
      },
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-emerald-200 shadow-xs">
              <CheckCircle className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Approved Results</h1>
              <p className="mt-0.5 text-sm text-emerald-700">
                {isLoading ? 'Loading…' : `${data?.data.length ?? 0} result${data?.data.length !== 1 ? 's' : ''} ready for release`}
              </p>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 h-9 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-60 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load approved results. Please try refreshing.
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {['Patient', 'Sample ID', 'Test Type', 'Approved At', 'Action'].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[180, 100, 120, 140, 80].map((w, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className={`h-3 bg-slate-100 rounded-md w-${w}`} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
                        <FlaskConical className="h-7 w-7 text-slate-300" />
                      </div>
                      <p className="font-semibold text-slate-800">No approved results</p>
                      <p className="text-xs text-slate-400">Approved results will appear here once the Supervisor approves them.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (data?.data ?? []).map((row) => (
                  <tr key={row.result_id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{row.patient_uid}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                        {row.sample_uid ?? '—'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500">{row.test_type ?? '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-500">{formatDate(row.approved_at)}</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleOpenModal(row)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-3 h-8 text-xs font-semibold text-white transition-colors cursor-pointer"
                      >
                        <Send className="h-3 w-3" />
                        Release
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination.has_more && (
          <div className="flex justify-end">
            <button
              onClick={() => setCursor(data.pagination.next_cursor ?? undefined)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 h-9 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Load more
            </button>
          </div>
        )}
      </div>

      <ReleaseConfirmationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleConfirm}
        isPending={releaseMutation.isPending}
        result={selectedResult}
        selectedMethod={selectedMethod}
        onSelectMethod={setSelectedMethod}
      />
    </>
  );
}