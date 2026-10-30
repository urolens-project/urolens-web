import { useState } from 'react';
import { Microscope, ImageOff, Save, RotateCcw, Images } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { AnnotationCanvas } from './AnnotationCanvas';
import { useSaveAnnotation } from '../hooks/useResultReview';
import { reviewerRoleLabel, PARTICLE_LABEL_DISPLAY } from '../constants';
import { FieldGrid } from '../../field-verification/components/FieldGrid';
import { useFieldDetail } from '../../field-verification/hooks/useFieldVerification';
import type { AnnotationItem, BoundingBox, FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
  // This viewer's own annotation entry (editable) — undefined if they
  // haven't left one yet on this result.
  myAnnotation: AnnotationItem | undefined;
  // Every other reviewer's entry — shown read-only, attributed by role.
  otherAnnotations: AnnotationItem[];
  onBoxesChange?: (boxes: BoundingBox[]) => void;
}

interface CountChange {
  parameter: string;
  before: number;
  after: number;
}

// Mirrors the backend's box-diff logic (result_review_service.py,
// _applyBoxDrivenCountAdjustments) exactly, so what the reviewer previews
// here is what actually gets saved — not an approximation. Boxes are
// matched by id: missing from `next` = removed, missing from `prev` =
// added (hand-drawn), present in both with a different particle_type =
// relabeled.
function computeCountChanges(
  prevBoxes: BoundingBox[],
  nextBoxes: BoundingBox[],
  aiFindings: Record<string, unknown>,
  particleClasses: Record<string, unknown>,
): CountChange[] {
  const prevById = new Map(prevBoxes.map((b) => [b.id, b]));
  const nextById = new Map(nextBoxes.map((b) => [b.id, b]));
  const delta = new Map<string, number>();

  for (const [id, prevBox] of prevById) {
    if (!nextById.has(id)) {
      delta.set(prevBox.particle_type, (delta.get(prevBox.particle_type) ?? 0) - 1);
    }
  }
  for (const [id, nextBox] of nextById) {
    const prevBox = prevById.get(id);
    if (!prevBox) {
      delta.set(nextBox.particle_type, (delta.get(nextBox.particle_type) ?? 0) + 1);
    } else if (prevBox.particle_type !== nextBox.particle_type) {
      delta.set(prevBox.particle_type, (delta.get(prevBox.particle_type) ?? 0) - 1);
      delta.set(nextBox.particle_type, (delta.get(nextBox.particle_type) ?? 0) + 1);
    }
  }

  const changes: CountChange[] = [];
  for (const [parameter, change] of delta) {
    if (change === 0) continue;
    const rawCurrent = particleClasses[parameter] ?? aiFindings[parameter] ?? 0;
    const before = typeof rawCurrent === 'number' ? rawCurrent : 0;
    const after = Math.max(0, before + change);
    if (after !== before) changes.push({ parameter, before, after });
  }
  return changes;
}

// Proposal §10.2: "Becomes a field gallery with a read-only viewer: AI
// boxes, removed boxes struck through, added boxes highlighted, with a
// toggle between 'AI' and 'Corrected'." The supervisor never edits
// fields directly (§3.4: "The supervisor no longer edits counts" —
// Return for Correction is the only path to changing a value), so this
// has no save/annotate flow at all, unlike the single-image view below.
function MultiFieldGallery({ result }: { result: FullResultDetail }) {
  const fields = result.fields ?? [];
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    fields[0]?.field_id ?? null,
  );
  const [showCorrected, setShowCorrected] = useState(true);
  const { data: fieldDetail, isLoading } = useFieldDetail(selectedFieldId ?? '');

  const boxes: BoundingBox[] = fieldDetail
    ? showCorrected
      ? [
          ...fieldDetail.detections
            .filter((d) => !fieldDetail.annotation_edits.removed_detection_ids.includes(d.id))
            .map(({ id, particle_type, x, y, w, h }): BoundingBox => ({
              id,
              particle_type,
              x,
              y,
              w,
              h,
            })),
          ...fieldDetail.annotation_edits.added_boxes.map(
            ({ id, particle_type, x, y, w, h }): BoundingBox => ({ id, particle_type, x, y, w, h }),
          ),
        ]
      : fieldDetail.detections.map(({ id, particle_type, x, y, w, h }): BoundingBox => ({
          id,
          particle_type,
          x,
          y,
          w,
          h,
        }))
    : [];

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-160">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
            <Images className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Fields ({fields.length})
          </h3>
        </div>
        {fieldDetail && (
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setShowCorrected(false)}
              className={`px-3 py-1.5 transition-colors ${!showCorrected ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              AI
            </button>
            <button
              onClick={() => setShowCorrected(true)}
              className={`px-3 py-1.5 transition-colors ${showCorrected ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              Corrected
            </button>
          </div>
        )}
      </div>

      <div className="p-4 border-b border-slate-100 shrink-0">
        <FieldGrid
          fields={fields}
          selectedFieldId={selectedFieldId}
          onSelect={setSelectedFieldId}
        />
      </div>

      <div className="flex-1 min-h-0 bg-slate-900 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
            Loading field…
          </div>
        ) : fieldDetail?.image_url ? (
          <AnnotationCanvas
            imageUrl={fieldDetail.image_url}
            boxes={boxes}
            onChange={() => {}}
            readOnly
            fullHeight
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
            <ImageOff className="h-10 w-10 text-slate-600" />
            <p className="text-sm font-medium">Select a field to view it.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function MicroscopyImageSection(props: Props) {
  // A legacy single-image result has no `fields` at all (optional,
  // never an empty array from a real response) — fall through to the
  // existing single-image annotation view unchanged. Only a genuine
  // multi-field result gets the gallery.
  if (props.result.fields && props.result.fields.length > 0) {
    return <MultiFieldGallery result={props.result} />;
  }
  return <SingleFieldAnnotationView {...props} />;
}

function SingleFieldAnnotationView({
  result,
  myAnnotation,
  otherAnnotations,
  onBoxesChange,
}: Props) {
  // If this reviewer has never saved an annotation on this result, seed the
  // canvas from the AI's own detected boxes — a draft to edit and confirm,
  // not a permanent read-only layer (see AnnotationInputControl/other-
  // reviewer boxes for the pattern that *is* read-only). Once saved, this
  // reviewer's own spatial_annotations always wins, even if empty — an
  // explicit "I cleared everything" must never be re-seeded from AI again.
  const isAiSeeded = !myAnnotation;
  const initialBoxes = myAnnotation
    ? (myAnnotation.spatial_annotations ?? [])
    : result.ai_detections.map((d): BoundingBox => ({
        id: d.id,
        particle_type: d.particle_type,
        x: d.x,
        y: d.y,
        w: d.w,
        h: d.h,
      }));
  const [boxes, setBoxes] = useState<BoundingBox[]>(initialBoxes);
  const [saved, setSaved] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mutation = useSaveAnnotation(result.result_id);

  function handleBoxesChange(next: BoundingBox[]) {
    setBoxes(next);
    onBoxesChange?.(next);
  }

  async function doSave() {
    await mutation.mutateAsync({
      notes: myAnnotation?.annotation_notes ?? '',
      boxes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Box edits don't affect particle counts until saved — but that's easy
  // to miss, since it looks like a silent no-op. When a save WOULD shift a
  // count, show exactly what changes and require explicit confirmation
  // before it actually happens.
  const pendingCountChanges = computeCountChanges(
    initialBoxes,
    boxes,
    result.ai_findings,
    result.particle_classes,
  );

  async function handleSaveClick() {
    if (pendingCountChanges.length > 0) {
      setConfirmOpen(true);
      return;
    }
    await doSave();
  }

  async function handleConfirmSave() {
    setConfirmOpen(false);
    await doSave();
  }

  const isDirty = JSON.stringify(boxes) !== JSON.stringify(initialBoxes);
  // AI-seeded boxes haven't been touched yet still need an explicit save to
  // become this reviewer's own annotation — isDirty alone would never be
  // true if the reviewer agrees with the AI's boxes as-is.
  // While a retake is pending, the backend refuses annotate/override/confirm
  // outright (UROLENS-230) — boxes drawn now would anchor to an image about
  // to be replaced, so the canvas goes read-only instead of letting a
  // reviewer do work that's guaranteed to 422 or go stale.
  const canSave = !result.is_retake_pending && (isDirty || (isAiSeeded && boxes.length > 0));
  const showAiSuggestedBadge = isAiSeeded && !isDirty && boxes.length > 0;
  const otherReviewerBoxes = otherAnnotations
    .filter((a) => (a.spatial_annotations?.length ?? 0) > 0)
    .map((a) => ({
      ownerLabel: reviewerRoleLabel(a.reviewer_role),
      boxes: a.spatial_annotations ?? [],
    }));

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-160">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
            <Microscope className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Microscopy Image
          </h3>
          {showAiSuggestedBadge ? (
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600">
              {boxes.length} AI-suggested box{boxes.length !== 1 ? 'es' : ''} — edit and save to
              confirm
            </span>
          ) : (
            boxes.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                {boxes.length} box{boxes.length !== 1 ? 'es' : ''}
              </span>
            )
          )}
        </div>
        <div className="flex items-center gap-2">
          {mutation.isError && <span className="text-xs text-red-600">Save failed.</span>}
          {canSave && (
            <Button size="sm" onClick={handleSaveClick} loading={mutation.isPending}>
              <Save className="h-3.5 w-3.5" />
              {saved ? 'Saved!' : isAiSeeded ? 'Confirm boxes' : 'Save boxes'}
            </Button>
          )}
        </div>
      </div>

      {/* Retake-pending banner — annotate/override/confirm all refuse while
          this is true, so the canvas is read-only rather than letting a
          reviewer draw boxes that are guaranteed to 422 or go stale. */}
      {result.is_retake_pending && (
        <div className="flex items-start gap-2.5 px-5 py-3 bg-amber-50 border-b border-amber-100 shrink-0">
          <RotateCcw className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-800 leading-relaxed">
            This result's image is mid-retake — the old findings are kept until a new image is
            uploaded. Annotating is disabled until then.
          </p>
        </div>
      )}

      {/* Canvas area — fills remaining height */}
      <div className="flex-1 min-h-0 bg-slate-900 relative">
        {result.image_url ? (
          <AnnotationCanvas
            imageUrl={result.image_url}
            boxes={boxes}
            onChange={handleBoxesChange}
            otherReviewerBoxes={otherReviewerBoxes}
            readOnly={result.is_retake_pending}
            fullHeight
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500">
            <ImageOff className="h-10 w-10 text-slate-600" />
            <p className="text-sm font-medium">No microscopy image attached.</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      {!result.is_retake_pending && (
        <div className="px-5 py-2 border-t border-slate-100 bg-slate-50 shrink-0">
          <p className="text-[10px] text-slate-400 font-medium">
            Click and drag on the image to draw bounding boxes. Click a box to remove it.
          </p>
        </div>
      )}

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm count changes">
        <p className="text-sm text-slate-600">
          Saving these box edits will update the particle counts below:
        </p>
        <ul className="mt-3 space-y-1.5">
          {pendingCountChanges.map((c) => (
            <li
              key={c.parameter}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-slate-700">
                {PARTICLE_LABEL_DISPLAY[c.parameter] ?? c.parameter}
              </span>
              <span className="font-mono text-slate-500">
                {c.before} <span className="text-slate-400">→</span>{' '}
                <span className={c.after > c.before ? 'text-emerald-600' : 'text-rose-600'}>
                  {c.after}
                </span>
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirmSave} loading={mutation.isPending}>
            Save & update counts
          </Button>
        </div>
      </Modal>
    </div>
  );
}
