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
import { SmartDiagnosisSectionPlaceholder } from './SmartDiagnosisSectionPlaceholder';

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
  
  // Define logic for when actions are allowed
  const canAct = data.status === 'PENDING_SUPERVISOR_APPROVAL';

  return (
  <div className="h-full overflow-y-auto bg-slate-50 p-6">
    <div className="mx-auto max-w-7xl space-y-6">
      
      {/* Header Section: Improved alignment and spacing */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/supervisor/results')}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Result Review</h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5 bg-slate-200/50 px-2 py-0.5 rounded w-fit">
              {data.result_id}
            </p>
          </div>
        </div>
        <Badge variant={statusInfo.variant} className="px-4 py-1 text-sm">
          {statusInfo.label}
        </Badge>
      </div>

      {/* Main Content Grid: Balanced spacing between columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        
        {/* Left Column: Data sections */}
        <div className="lg:col-span-2 space-y-6">
          <PatientInfoSection result={data} />
          <AIFindingsSection result={data} />
          <MedTechConfirmationSection result={data} />
          <ManualOverridesSection result={data} />
          <SmartDiagnosisSectionPlaceholder result={data} />
        </div>

        {/* Right Column: Imagery and Actions */}
        <div className="space-y-6">
          <MicroscopyImageSection result={data} />
          <AnnotationInputControl resultId={resultId} initialNotes={data.annotation_notes} />

          {/* Action Panel: Refined button layouts */}
          {canAct && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Supervisor Actions
              </p>
              <div className="space-y-2">
                <Button className="w-full justify-start gap-2" onClick={() => setApproveOpen(true)}>
                  <CheckCircle className="h-4 w-4" />
                  Approve Result
                </Button>
                <Button variant="secondary" className="w-full justify-start gap-2" onClick={() => setReturnOpen(true)}>
                  <RotateCcw className="h-4 w-4" />
                  Return for Correction
                </Button>
                <Button variant="danger" className="w-full justify-start gap-2" onClick={() => setEscalateOpen(true)}>
                  <AlertTriangle className="h-4 w-4" />
                  Escalate
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ApproveModal resultId={resultId} open={approveOpen} onClose={() => setApproveOpen(false)} onSuccess={handleActionSuccess} />
      <ReturnModal resultId={resultId} open={returnOpen} onClose={() => setReturnOpen(false)} onSuccess={handleActionSuccess} />
      <EscalateModal resultId={resultId} open={escalateOpen} onClose={() => setEscalateOpen(false)} onSuccess={handleActionSuccess} />
    </div>
  </div>
);
}