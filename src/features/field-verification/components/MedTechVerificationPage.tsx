// Proposal §10.1 MedTechVerificationPage: "Opens one result for
// verification, lists its fields, shows per-class running averages
// that update as corrections are saved." Route: /medtech/verify/:resultId
// — not wired into App.tsx yet; see this feature's index.tsx.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Images, RotateCcw, XCircle } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Spinner } from '../../../components/ui/Spinner';
import {
  useResultFields,
  useReopenCapture,
  useFieldDetail,
  useVerifyField,
  useDiscardField,
} from '../hooks/useFieldVerification';
import { FieldGrid } from './FieldGrid';
import { FieldAnnotationEditor } from './FieldAnnotationEditor';
import { FieldCountsPanel } from './FieldCountsPanel';
import { VerificationSummary } from './VerificationSummary';
import { ConfirmResultDialog } from './ConfirmResultDialog';
import type { FieldSummaryItem } from '../types';

// The field a MedTech most likely wants to see first: the earliest
// accepted-but-unchecked one, falling back to the first field at all —
// landing on an empty "select a field" screen every time this page
// opens is a dead end, not a starting point.
function pickDefaultField(fields: FieldSummaryItem[]): string | null {
  const firstUndecided = fields.find((f) => f.status === 'ACCEPTED' && !f.verified_by);
  return (firstUndecided ?? fields[0])?.field_id ?? null;
}

export function MedTechVerificationPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: fieldList, isLoading, isError } = useResultFields(resultId ?? '');
  // Nothing explicitly selected yet (page just opened) falls back to the
  // best default — computed at render time, not via an effect that
  // would set state and trigger a second render for the same frame.
  const effectiveFieldId =
    selectedFieldId ?? (fieldList ? pickDefaultField(fieldList.items) : null);
  const { data: fieldDetail } = useFieldDetail(effectiveFieldId ?? '');
  const verifyMutation = useVerifyField(resultId ?? '', effectiveFieldId ?? '');
  const discardMutation = useDiscardField(resultId ?? '', effectiveFieldId ?? '');
  const reopenMutation = useReopenCapture(resultId ?? '');

  if (!resultId) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !fieldList) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Failed to load this result's fields.
      </div>
    );
  }

  const editable =
    fieldList.result_status === 'PENDING_CONFIRM' ||
    fieldList.result_status === 'RETURNED_FOR_CORRECTION';
  const readyToConfirm = editable && fieldList.undecided_field_count === 0;
  const progressPct = Math.min(
    100,
    Math.round(
      (fieldList.verified_field_count / Math.max(1, fieldList.accepted_field_count)) * 100,
    ),
  );

  async function handleDiscard() {
    if (!effectiveFieldId) return;
    const reason = window.prompt('Reason for excluding this field?');
    if (!reason?.trim()) return;
    await discardMutation.mutateAsync({ reason: reason.trim() });
    setSelectedFieldId(null);
  }

  return (
    <div className="bg-[#F4F6FB] p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Header banner */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-blue-200/60">
          <div className="bg-linear-to-r from-blue-700 via-sky-600 to-sky-500 px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => navigate('/medtech/verify')}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold text-white tracking-tight">
                    Field Verification
                  </h1>
                  <p className="mt-1 text-sm text-sky-100">
                    {fieldList.accepted_field_count} of {fieldList.min_fields}+ fields accepted
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  fieldList.result_status === 'RETURNED_FOR_CORRECTION' ? 'warning' : 'default'
                }
              >
                {fieldList.result_status.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
          {/* Checked-fields progress bar */}
          <div className="bg-sky-950/90 px-6 py-2.5 flex items-center gap-3">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-widest shrink-0">
              {fieldList.verified_field_count} / {fieldList.accepted_field_count} checked
            </span>
            <div className="h-1.5 flex-1 rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Action bar */}
        {editable && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 shadow-sm">
            <Button variant="secondary" size="sm" onClick={() => setShowSummary((s) => !s)}>
              <Images className="h-3.5 w-3.5" />
              {showSummary ? 'Back to Fields' : 'Review Summary'}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => reopenMutation.mutate()}
                loading={reopenMutation.isPending}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Capture More Fields
              </Button>
              <Button
                size="sm"
                onClick={() => setConfirmOpen(true)}
                disabled={!readyToConfirm}
                title={
                  readyToConfirm
                    ? undefined
                    : `${fieldList.undecided_field_count} field${fieldList.undecided_field_count !== 1 ? 's' : ''} still need checking`
                }
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Confirm for Supervisor Review
              </Button>
            </div>
          </div>
        )}

        {showSummary ? (
          <VerificationSummary resultId={resultId} />
        ) : (
          <>
            {/* Field filmstrip */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50/60">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Fields ({fieldList.items.length})
                </p>
              </div>
              <div className="p-4">
                <FieldGrid
                  fields={fieldList.items}
                  selectedFieldId={effectiveFieldId}
                  onSelect={setSelectedFieldId}
                />
              </div>
            </div>

            {/* Selected field detail */}
            {fieldDetail ? (
              <div className="grid gap-5 lg:grid-cols-3 items-start">
                <div className="lg:col-span-2">
                  <FieldAnnotationEditor
                    resultId={resultId}
                    field={fieldDetail}
                    readOnly={!editable}
                  />
                </div>
                <div className="space-y-4">
                  <FieldCountsPanel resultId={resultId} field={fieldDetail} readOnly={!editable} />
                  {editable && fieldDetail.status !== 'DISCARDED' && (
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={handleDiscard}
                        loading={discardMutation.isPending}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Exclude Field
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => verifyMutation.mutate()}
                        loading={verifyMutation.isPending}
                        disabled={!!fieldDetail.verified_by}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        {fieldDetail.verified_by ? 'Checked' : 'Mark as Checked'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center">
                <Images className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Select a field above to review it.</p>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmResultDialog
        resultId={resultId}
        open={confirmOpen}
        canConfirm={readyToConfirm}
        onClose={() => setConfirmOpen(false)}
        onSuccess={() => navigate('/medtech/verify')}
      />
    </div>
  );
}
