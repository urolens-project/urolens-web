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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/supervisor/results')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Result Review</h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{data.result_id}</p>
          </div>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>

      {/* Content grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <PatientInfoSection result={data} />
          <AIFindingsSection result={data} />
          <MedTechConfirmationSection result={data} />
          <ManualOverridesSection result={data} />
          <SmartDiagnosisResultPanel resultId={data.result_id} />
        </div>
        <div className="space-y-4">
          <MicroscopyImageSection result={data} />
          <AnnotationInputControl resultId={resultId} initialNotes={data.annotation_notes} />

          {canAct && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Actions</p>
              <Button
                className="w-full"
                onClick={() => setApproveOpen(true)}
              >
                <CheckCircle className="h-4 w-4" />
                Approve Result
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setReturnOpen(true)}
              >
                <RotateCcw className="h-4 w-4" />
                Return for Correction
              </Button>
              <Button
                variant="danger"
                className="w-full"
                onClick={() => setEscalateOpen(true)}
              >
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
