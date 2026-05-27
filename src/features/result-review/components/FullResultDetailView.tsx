import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Spinner } from '../../../components/ui/Spinner';
import { useFullResult, useSaveAnnotation } from '../hooks/useResultReview';
import type { BoundingBox } from '../types';
import { AIFindingsSection } from './AIFindingsSection';
import { AnnotationInputControl } from './AnnotationInputControl';
import { ApproveModal } from './ApproveModal';
import { EscalateModal } from './EscalateModal';
import { ManualOverridesSection } from './ManualOverridesSection';
import { MedTechConfirmationSection } from './MedTechConfirmationSection';
import { MicroscopyImageSection } from './MicroscopyImageSection';
import { PatientInfoSection } from './PatientInfoSection';
import { ReturnModal } from './ReturnModal';
import { SmartDiagnosisSection } from './SmartDiagnosisSection';

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
  const saveAnnotationMutation = useSaveAnnotation(resultId ?? '');

  // Tracks the latest drawn boxes so we can flush them before any action.
  const pendingBoxesRef = useRef<BoundingBox[] | null>(null);

  const [approveOpen, setApproveOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);

  async function flushBoxesIfDirty() {
    if (!data || pendingBoxesRef.current === null) return;
    const saved = JSON.stringify(data.spatial_annotations ?? []);
    const pending = JSON.stringify(pendingBoxesRef.current);
    if (saved === pending) return;
    await saveAnnotationMutation.mutateAsync({
      notes: data.annotation_notes ?? '',
      boxes: pendingBoxesRef.current,
    });
  }

  async function openApprove() { await flushBoxesIfDirty(); setApproveOpen(true); }
  async function openReturn()  { await flushBoxesIfDirty(); setReturnOpen(true); }
  async function openEscalate(){ await flushBoxesIfDirty(); setEscalateOpen(true); }

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

  const patientMeta = [
    data.patient_age != null ? `${data.patient_age} yrs` : null,
    data.patient_sex ? data.patient_sex.charAt(0) + data.patient_sex.slice(1).toLowerCase() : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="h-full overflow-y-auto bg-[#F4F6FB] p-6">
      <div className="mx-auto max-w-7xl space-y-5">

        {/* ── Gradient Header Banner ── */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-violet-200/60">
          <div className="bg-linear-to-r from-violet-700 via-indigo-600 to-indigo-500 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => navigate('/supervisor/results')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl font-bold text-white tracking-tight">Result Review</h1>
                    <span className="inline-flex items-center rounded-lg bg-white/15 px-2.5 py-0.5 text-[10px] font-mono text-violet-100 tracking-widest border border-white/10">
                      {data.result_id.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-violet-100 truncate">
                    {data.patient_name}
                    {patientMeta ? ` · ${patientMeta}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge variant={statusInfo.variant} className="px-3 py-1 text-xs font-semibold">
                  {statusInfo.label}
                </Badge>
                <span className="text-[10px] text-violet-200 font-mono tracking-wider">
                  Spec: {data.specimen_id.slice(0, 8).toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-bar: model version + supervisor label */}
          <div className="bg-indigo-950/90 px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-300" />
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
                Supervisor Review Workspace
              </span>
            </div>
            <span className="text-[10px] text-indigo-400 font-mono">
              Model v{data.model_version || '—'}
            </span>
          </div>
        </div>

        {/* ── Patient Info: full-width above the grid ── */}
        <PatientInfoSection result={data} />

        {/* ── Main Content Grid: image-first ── */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Left col (2/3): microscopy canvas — primary review artifact */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <MicroscopyImageSection
              result={data}
              onBoxesChange={(boxes) => { pendingBoxesRef.current = boxes; }}
            />
            <AnnotationInputControl resultId={resultId} initialNotes={data.annotation_notes} />
          </div>

          {/* Right col (1/3): data sections + actions */}
          <div className="space-y-4">
            {/* ── Action Panel ── */}
            {canAct && (
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Supervisor Actions
                  </p>
                </div>
                <div className="p-4 space-y-2.5">
                  <button
                    onClick={openApprove}
                    className="w-full flex items-center gap-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white px-4 h-11 font-semibold text-sm transition-colors cursor-pointer shadow-sm shadow-emerald-200"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Approve Result</span>
                  </button>
                  <button
                    onClick={openReturn}
                    className="w-full flex items-center gap-3 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-700 px-4 h-11 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    <span>Return for Correction</span>
                  </button>
                  <button
                    onClick={openEscalate}
                    className="w-full flex items-center gap-3 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white px-4 h-11 font-semibold text-sm transition-colors cursor-pointer shadow-sm shadow-rose-200"
                  >
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Escalate Case</span>
                  </button>
                </div>
                <div className="px-5 pb-4">
                  <p className="text-[10px] text-slate-400 text-center leading-relaxed">
                    All actions are logged and cannot be undone.
                  </p>
                </div>
              </div>
            )}

            <AIFindingsSection result={data} />
            <MedTechConfirmationSection result={data} />
            <ManualOverridesSection result={data} />
            <SmartDiagnosisSection result={data} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ApproveModal resultId={resultId} open={approveOpen} onClose={() => setApproveOpen(false)} onSuccess={handleActionSuccess} />
      <ReturnModal resultId={resultId} open={returnOpen} onClose={() => setReturnOpen(false)} onSuccess={handleActionSuccess} />
      <EscalateModal resultId={resultId} open={escalateOpen} onClose={() => setEscalateOpen(false)} onSuccess={handleActionSuccess} />
    </div>
  );
}