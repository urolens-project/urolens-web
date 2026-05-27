import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, RotateCcw, AlertTriangle } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { useFullResult } from '../hooks/useResultReview';
import { AIFindingsSection } from './AIFindingsSection';
import { AnnotationInputControl } from './AnnotationInputControl';
import { ApproveModal } from './ApproveModal';
import { EscalateModal } from './EscalateModal';
import { ManualOverridesSection } from './ManualOverridesSection';
import { MedTechConfirmationSection } from './MedTechConfirmationSection';
import { MicroscopyImageSection } from './MicroscopyImageSection';
import { PatientInfoSection } from './PatientInfoSection';
import { ReturnModal } from './ReturnModal';
import { SmartDiagnosisResultPanel } from '../../../features/smart-diagnosis';

const STATUS_BADGE: Record<string, { variant: 'warning' | 'success' | 'danger' | 'default' | 'info'; label: string }> = {
  PENDING_SUPERVISOR_APPROVAL: { variant: 'warning', label: 'Pending Approval' },
  APPROVED: { variant: 'success', label: 'Approved' },
  RETURNED_FOR_CORRECTION: { variant: 'info', label: 'Returned' },
  CRITICAL_ESCALATED: { variant: 'danger', label: 'Critical Escalated' },
};

export function FullResultDetailView() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useFullResult(resultId ?? '');

  const [approveOpen, setApproveOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);

  function handleActionSuccess() {
    navigate('/supervisor/results');
  }

  if (!resultId) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load result details. Please go back and try again.
      </div>
    );
  }

  const statusInfo = STATUS_BADGE[data.status] ?? { variant: 'default', label: data.status };
  const canAct = data.status === 'PENDING_SUPERVISOR_APPROVAL';

  return (
    <div className="flex flex-col h-full min-h-0 gap-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/supervisor/results')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">Result Review</h1>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{data.result_id}</p>
          </div>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {/* ── Patient info bar ── */}
      <div className="flex-shrink-0">
        <PatientInfoSection result={data} />
      </div>

      {/* ── Main split: image (left) + findings panel (right) ── */}
      <div className="flex gap-4 min-h-0 flex-1">

        {/* Left — large image viewer */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <MicroscopyImageSection result={data} />
        </div>

        {/* Right — scrollable findings + actions */}
        <div className="w-[420px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto pb-4 pr-1">

          <AIFindingsSection result={data} />
          <SmartDiagnosisResultPanel resultId={data.result_id} />
          <MedTechConfirmationSection result={data} />
          <ManualOverridesSection result={data} />
          <AnnotationInputControl resultId={resultId} initialNotes={data.annotation_notes} />

          {/* Actions */}
          {canAct && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</p>
              <Button className="w-full" onClick={() => setApproveOpen(true)}>
                <CheckCircle className="h-4 w-4" />
                Approve Result
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => setReturnOpen(true)}>
                <RotateCcw className="h-4 w-4" />
                Return for Correction
              </Button>
              <Button variant="danger" className="w-full" onClick={() => setEscalateOpen(true)}>
                <AlertTriangle className="h-4 w-4" />
                Escalate
              </Button>
            </div>
          )}
        </div>
      </div>

      <ApproveModal
        resultId={resultId}
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onSuccess={handleActionSuccess}
      />
      <ReturnModal
        resultId={resultId}
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        onSuccess={handleActionSuccess}
      />
      <EscalateModal
        resultId={resultId}
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        onSuccess={handleActionSuccess}
      />
    </div>
  );
}
