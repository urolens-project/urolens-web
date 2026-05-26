import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useApproveResult } from '../hooks/useResultReview';

interface Props {
  resultId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApproveModal({ resultId, open, onClose, onSuccess }: Props) {
  const [notes, setNotes] = useState('');
  const mutation = useApproveResult(resultId);

  async function handleConfirm() {
    await mutation.mutateAsync(notes.trim() || undefined);
    onSuccess();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Approve Result" maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
          <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-800">
            This result will be marked as <strong>Approved</strong> and released for physician review.
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Approval notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any final notes…"
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </div>
        {mutation.isError && (
          <p className="text-xs text-red-600">Failed to approve. Please try again.</p>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} loading={mutation.isPending}>
            Confirm Approval
          </Button>
        </div>
      </div>
    </Modal>
  );
}
