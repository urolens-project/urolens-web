import { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Spinner } from '../../../components/ui/Spinner';
import { ReleaseMethodSelector } from './ReleaseMethodSelector';
import { useReleaseResult } from '../hooks/useReleaseResult';
import type { ApprovedResultItem, ReleaseMethod } from '../types';

interface ReleaseConfirmationModalProps {
  result: ApprovedResultItem;
  onClose: () => void;
}

export function ReleaseConfirmationModal({ result, onClose }: ReleaseConfirmationModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<ReleaseMethod | null>(null);
  const mutation = useReleaseResult();

  function handleConfirm() {
    if (!selectedMethod) return;
    mutation.mutate(
      { resultId: result.result_id, releaseMethod: selectedMethod },
      { onSuccess: onClose },
    );
  }

  return (
    <Modal open title="Release Result" onClose={onClose} maxWidth="md">
      <div className="space-y-5">
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-sm space-y-1">
          <p>
            <span className="font-medium text-slate-500">Patient</span>
            <span className="ml-2 text-slate-800">{result.patient_name}</span>
          </p>
          <p>
            <span className="font-medium text-slate-500">Sample UID</span>
            <span className="ml-2 text-slate-800">{result.sample_uid ?? '—'}</span>
          </p>
          {result.test_type && (
            <p>
              <span className="font-medium text-slate-500">Test Type</span>
              <span className="ml-2 text-slate-800">{result.test_type}</span>
            </p>
          )}
          <p>
            <span className="font-medium text-slate-500">Approved</span>
            <span className="ml-2 text-slate-800">
              {new Date(result.approved_at).toLocaleString()}
            </span>
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-700 mb-2">Select release method</p>
          <ReleaseMethodSelector value={selectedMethod} onChange={setSelectedMethod} />
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedMethod || mutation.isPending}
            aria-disabled={!selectedMethod || mutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending && <Spinner size="sm" />}
            Confirm Release
          </button>
        </div>
      </div>
    </Modal>
  );
}
