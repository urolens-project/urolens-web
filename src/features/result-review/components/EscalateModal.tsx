import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useEscalateResult } from '../hooks/useResultReview';
import { ESCALATION_PATH_LABELS, type EscalationPath } from '../types';

const PATHS: EscalationPath[] = ['NOTIFY_PHYSICIAN', 'FLAG_SENIOR_REVIEW', 'MARK_CRITICAL'];

const pathDescriptions: Record<EscalationPath, string> = {
  NOTIFY_PHYSICIAN: 'Alert the attending physician about this finding.',
  FLAG_SENIOR_REVIEW: 'Queue this result for review by a senior laboratory staff.',
  MARK_CRITICAL: 'Mark as a critical finding requiring immediate action.',
};

interface Props {
  resultId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EscalateModal({ resultId, open, onClose, onSuccess }: Props) {
  const [path, setPath] = useState<EscalationPath>('NOTIFY_PHYSICIAN');
  const [note, setNote] = useState('');
  const mutation = useEscalateResult(resultId);

  async function handleConfirm() {
    await mutation.mutateAsync({ escalationPath: path, escalationNote: note.trim() || undefined });
    onSuccess();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Escalate Result" maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-100 p-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800">
            Select an escalation pathway for this result. This action changes the result status to{' '}
            <strong>Critical Escalated</strong>.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-600">Escalation Pathway</p>
          {PATHS.map((p) => (
            <label
              key={p}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                path === p
                  ? 'border-red-300 bg-red-50'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="escalation_path"
                value={p}
                checked={path === p}
                onChange={() => setPath(p)}
                className="mt-0.5 accent-red-600"
              />
              <div>
                <p className="text-sm font-semibold text-slate-800">{ESCALATION_PATH_LABELS[p]}</p>
                <p className="text-xs text-slate-500">{pathDescriptions[p]}</p>
              </div>
            </label>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">
            Escalation note (optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Additional context for the escalation…"
            rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </div>

        {mutation.isError && (
          <p className="text-xs text-red-600">Failed to escalate. Please try again.</p>
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleConfirm} loading={mutation.isPending}>
            Escalate Result
          </Button>
        </div>
      </div>
    </Modal>
  );
}
