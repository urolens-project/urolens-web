import { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, FlaskConical, RotateCcw } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import { SmartDiagnosisPanel } from '../../smart-diagnosis';
import { useFullResult } from '../../result-review/hooks/useResultReview';
import { AIFindingsSection } from '../../result-review/components/AIFindingsSection';
import { ManualOverridesSection } from '../../result-review/components/ManualOverridesSection';
import { PatientInfoSection } from '../../result-review/components/PatientInfoSection';
import { useConfirmResult } from '../hooks/useMedtechConfirmation';
import { MedtechImageViewer } from './MedtechImageViewer';

interface LocationState {
  returnReason?: string | null;
}

export function ResultConfirmationDetailView() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnReason = (location.state as LocationState | null)?.returnReason;

  const { data, isLoading, isError } = useFullResult(resultId ?? '');
  const confirmMutation = useConfirmResult(resultId ?? '');
  const [confirmError, setConfirmError] = useState('');

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

  const isReturned = data.status === 'RETURNED_FOR_CORRECTION';
  const canConfirm = data.status === 'PENDING_CONFIRM' || isReturned;

  const patientMeta = [
    data.patient_age != null ? `${data.patient_age} yrs` : null,
    data.patient_sex ? data.patient_sex.charAt(0) + data.patient_sex.slice(1).toLowerCase() : null,
  ].filter(Boolean).join(' · ');

  async function handleConfirm() {
    setConfirmError('');
    try {
      await confirmMutation.mutateAsync();
      toast.success(isReturned ? 'Result re-submitted for supervisor approval.' : 'Result confirmed.');
      navigate('/medtech/results');
    } catch {
      setConfirmError('Failed to confirm. Please try again.');
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6FB] p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header banner */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-blue-200/60">
          <div className="bg-linear-to-r from-blue-700 via-sky-600 to-sky-500 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => navigate('/medtech/results')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl font-bold text-white tracking-tight">Confirm Result</h1>
                    <span className="inline-flex items-center rounded-lg bg-white/15 px-2.5 py-0.5 text-[10px] font-mono text-sky-100 tracking-widest border border-white/10">
                      {data.result_id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-sky-100 truncate">
                    {data.patient_uid}
                    {patientMeta ? ` · ${patientMeta}` : ''}
                  </p>
                </div>
              </div>
              <Badge variant={isReturned ? 'warning' : 'default'} className="px-3 py-1 text-xs font-semibold shrink-0">
                {isReturned ? 'Returned for Correction' : 'Pending Confirmation'}
              </Badge>
            </div>
          </div>
          <div className="bg-sky-950/90 px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5 text-sky-300" />
              <span className="text-[10px] font-bold text-sky-300 uppercase tracking-widest">
                MedTech Confirmation Workspace
              </span>
            </div>
            <span className="text-[10px] text-sky-400 font-mono">Model v{data.model_version || '—'}</span>
          </div>
        </div>

        {isReturned && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
            <RotateCcw className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Returned by the Supervisor for correction</p>
              <p className="mt-0.5 text-sm text-amber-700">
                {returnReason || 'Review the AI findings below, correct any values, then re-confirm.'}
              </p>
            </div>
          </div>
        )}

        <PatientInfoSection result={data} />

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <MedtechImageViewer result={data} />
          </div>

          <div className="space-y-4">
            {canConfirm && (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">MedTech Action</p>
                </div>
                <div className="p-4 space-y-2.5">
                  <Button
                    onClick={handleConfirm}
                    loading={confirmMutation.isPending}
                    size="lg"
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    {isReturned ? 'Re-confirm & Submit' : 'Confirm Result'}
                  </Button>
                  {confirmError && <p className="text-xs text-red-600 text-center">{confirmError}</p>}
                </div>
                <div className="px-5 pb-4">
                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    Correct any AI findings below before confirming — this sends the result to the Supervisor for approval.
                  </p>
                </div>
              </div>
            )}

            <AIFindingsSection result={data} />
            <ManualOverridesSection result={data} />
            <SmartDiagnosisPanel data={data.smart_diagnosis} unavailable={data.smart_diagnosis_unavailable} />
          </div>
        </div>
      </div>
    </div>
  );
}
