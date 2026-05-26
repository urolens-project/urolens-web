import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { Table } from '../../../components/ui/Table';
import { usePendingResults } from '../hooks/useResultReview';
import type { PendingResultItem } from '../types';

const PAGE_SIZE = 20;

function formatAge(age: number | null, sex: string | null): string {
  const parts: string[] = [];
  if (age !== null) parts.push(`${age}y`);
  if (sex) parts.push(sex.charAt(0).toUpperCase() + sex.slice(1).toLowerCase());
  return parts.join(' / ') || '—';
}

function formatTimestamp(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function PendingApprovalQueueView() {
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { data, isLoading, isError } = usePendingResults(page, PAGE_SIZE);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const columns = [
    {
      key: 'patient',
      header: 'Patient',
      render: (row: PendingResultItem) => (
        <div>
          <p className="font-semibold text-slate-800">{row.patient_name || '—'}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatAge(row.patient_age, row.patient_sex)}</p>
        </div>
      ),
    },
    {
      key: 'specimen_id',
      header: 'Sample ID',
      render: (row: PendingResultItem) => (
        <span className="font-mono text-xs text-slate-600">{row.specimen_id.slice(0, 8).toUpperCase()}</span>
      ),
    },
    {
      key: 'medtech',
      header: 'MedTech',
      render: (row: PendingResultItem) => (
        <span className="text-slate-700">{row.medtech_name || '—'}</span>
      ),
    },
    {
      key: 'confirmed_at',
      header: 'Confirmed',
      render: (row: PendingResultItem) => (
        <span className="text-slate-500 text-xs">{formatTimestamp(row.confirmed_at)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (_row: PendingResultItem) => (
        <Badge variant="warning">Pending Approval</Badge>
      ),
    },
    {
      key: 'action',
      header: '',
      render: (row: PendingResultItem) => (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => navigate(`/supervisor/results/${row.result_id}`)}
        >
          Review
        </Button>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
          <ClipboardList className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pending Result Approvals</h1>
          {data && (
            <p className="text-sm text-slate-500">{data.total} result{data.total !== 1 ? 's' : ''} awaiting review</p>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load pending results. Please try refreshing.
        </div>
      )}

      {data && (
        <>
          <Table
            columns={columns}
            data={data.items}
            keyExtractor={(row) => row.result_id}
            emptyMessage="No results pending approval."
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
