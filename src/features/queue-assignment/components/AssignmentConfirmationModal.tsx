import { Loader2, FlaskConical, User } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import type { PendingSpecimenItem, MedTechWorkloadItem } from '../types';

interface AssignmentConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  specimen: PendingSpecimenItem | null;
  medtech: MedTechWorkloadItem | null;
}

export function AssignmentConfirmationModal({
  open,
  onClose,
  onConfirm,
  isPending,
  specimen,
  medtech,
}: AssignmentConfirmationModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Assignment" maxWidth="sm">
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          You are about to assign the following specimen:
        </p>

        {specimen && (
          <div className="flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-100 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{specimen.sample_uid}</p>
              <p className="text-xs text-slate-500 truncate">{specimen.patient_name} · {specimen.test_type}</p>
            </div>
          </div>
        )}

        <p className="text-sm text-slate-600">to Medical Technologist:</p>

        {medtech && (
          <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{medtech.full_name}</p>
              <p className="text-xs text-slate-500">{medtech.active_count} active specimen{medtech.active_count !== 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Assigning…
              </>
            ) : (
              'Confirm Assignment'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
