// Proposal §10.1 ConfirmResultDialog: post the confirmation with the
// interpretation note. POST /results/{id}/confirm is NOT one of PR
// #91's stub routes — it's the existing, working route (foundation-
// plan.md §4.1: "not touched" by the foundation work) — so this reuses
// medtech-confirmation's real useConfirmResult hook rather than a new
// field-verification one. It still runs today's single-image
// confirmation logic until a lane changes it to the field-aware
// version (proposal §2.7); the dialog itself doesn't change either way.
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useConfirmResult } from '../../medtech-confirmation/hooks/useMedtechConfirmation';

interface Props {
  resultId: string;
  open: boolean;
  canConfirm: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConfirmResultDialog({ resultId, open, canConfirm, onClose, onSuccess }: Props) {
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const mutation = useConfirmResult(resultId);

  async function handleConfirm() {
    setError('');
    try {
      await mutation.mutateAsync(notes.trim() || undefined);
      onSuccess();
    } catch {
      setError('Failed to confirm the result. Please try again.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Confirm for Supervisor Review" maxWidth="md">
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">
            Interpretation notes{' '}
            <span className="text-slate-300 font-normal normal-case">
              (optional — shown to the patient)
            </span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Plain-language summary for the patient's result…"
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        {!canConfirm && (
          <p className="text-xs text-amber-700">
            This result isn't ready to confirm yet — check the verification summary for what's still
            needed.
          </p>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleConfirm}
            loading={mutation.isPending}
            disabled={!canConfirm}
          >
            <CheckCircle className="h-4 w-4" />
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
}
