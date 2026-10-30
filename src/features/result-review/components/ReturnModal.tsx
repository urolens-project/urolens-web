import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useReturnResult } from '../hooks/useResultReview';
import { getReturnErrorMessage } from '../utils/errors';
import { PARTICLE_LABEL_DISPLAY, PARTICLE_LABELS } from '../constants';
import type { FieldSummaryItem } from '../../field-verification/types';

interface Props {
  resultId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Proposal §4 "Effects on Modules 3 and 4": "Return for Correction is
  // now the only way a supervisor changes a value, so the return reason
  // should name the field and particle concerned." Omit for a legacy
  // single-image result — the picker only makes sense once there's more
  // than one field to point at.
  fields?: FieldSummaryItem[];
}

export function ReturnModal({ resultId, open, onClose, onSuccess, fields }: Props) {
  const [reason, setReason] = useState('');
  const [fieldNo, setFieldNo] = useState<number | ''>('');
  const [particleType, setParticleType] = useState('');
  const mutation = useReturnResult(resultId);

  function composedReason(): string {
    const trimmed = reason.trim();
    if (!fields?.length || (fieldNo === '' && !particleType)) return trimmed;
    const parts: string[] = [];
    if (fieldNo !== '') parts.push(`Field ${fieldNo}`);
    if (particleType) parts.push(PARTICLE_LABEL_DISPLAY[particleType] ?? particleType);
    return parts.length ? `[${parts.join(' · ')}] ${trimmed}` : trimmed;
  }

  async function handleConfirm() {
    if (!reason.trim()) return;
    try {
      await mutation.mutateAsync(composedReason());
    } catch {
      return;
    }
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
        {!!fields?.length && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Field</label>
              <select
                value={fieldNo}
                onChange={(e) => setFieldNo(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Not specific to one field</option>
                {fields.map((f) => (
                  <option key={f.field_id} value={f.field_no}>
                    Field {f.field_no}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Particle</label>
              <select
                value={particleType}
                onChange={(e) => setParticleType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-200"
              >
                <option value="">Not specific to one particle</option>
                {PARTICLE_LABELS.map((key) => (
                  <option key={key} value={key}>
                    {PARTICLE_LABEL_DISPLAY[key]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
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
          <p className="text-xs text-red-600">{getReturnErrorMessage(mutation.error)}</p>
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
