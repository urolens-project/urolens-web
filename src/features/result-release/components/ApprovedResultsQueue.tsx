import { useState } from 'react';
import { Table } from '../../../components/ui/Table';
import { Spinner } from '../../../components/ui/Spinner';
import { ReleaseConfirmationModal } from './ReleaseConfirmationModal';
import { useApprovedResults } from '../hooks/useApprovedResults';
import type { ApprovedResultItem } from '../types';

export function ApprovedResultsQueue() {
  const { data, isLoading } = useApprovedResults();
  const [selectedResult, setSelectedResult] = useState<ApprovedResultItem | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const results = data?.data ?? [];

  const columns = [
    {
      key: 'patient_name',
      header: 'Patient Name',
      render: (row: ApprovedResultItem) => (
        <span className="font-medium text-slate-800">{row.patient_name}</span>
      ),
    },
    {
      key: 'sample_uid',
      header: 'Sample UID',
      render: (row: ApprovedResultItem) => (
        <span className="font-mono text-slate-700">{row.sample_uid ?? '—'}</span>
      ),
    },
    {
      key: 'test_type',
      header: 'Test Type',
      render: (row: ApprovedResultItem) => (
        <span className="text-slate-600">{row.test_type ?? '—'}</span>
      ),
    },
    {
      key: 'approved_at',
      header: 'Approved At',
      render: (row: ApprovedResultItem) => (
        <span className="text-slate-500 text-xs">
          {new Date(row.approved_at).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Release',
      render: (row: ApprovedResultItem) => (
        <button
          type="button"
          onClick={() => setSelectedResult(row)}
          aria-label={`Release result for ${row.patient_name}`}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
        >
          Release
        </button>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        data={results}
        keyExtractor={(row) => row.result_id}
        emptyMessage="No approved results awaiting release."
      />

      {selectedResult && (
        <ReleaseConfirmationModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </>
  );
}
