import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useReturnResult } from '../hooks/useResultReview';

interface Props {
  resultId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReturnModal({ resultId, open, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const mutation = useReturnResult(resultId);

  async function handleConfirm() {
    if (!reason.trim()) return;
    await mutation.mutateAsync(reason.trim());
    onSuccess();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Return for Correction" maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-amber-50 border border-amber-100 p-3">
          <RotateCcw className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            This result will be <strong>returned to the MedTech</strong> for correction.
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Reason for return <span className="text-red-500">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe what needs to be corrected…"
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
          />
        </div>
        {mutation.isError && (
          <p className="text-xs text-red-600">Failed to return result. Please try again.</p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleConfirm}
            loading={mutation.isPending}
            disabled={!reason.trim()}
            className="border-amber-300 text-amber-700 hover:bg-amber-50"
          >
            Return for Correction
          </Button>
        </div>
      </div>
    </Modal>
  );
}
