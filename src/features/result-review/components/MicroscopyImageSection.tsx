import { useState } from 'react';
import { Microscope, ImageOff, Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { AnnotationCanvas } from './AnnotationCanvas';
import { useSaveAnnotation } from '../hooks/useResultReview';
import { reviewerRoleLabel } from '../constants';
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

export function MicroscopyImageSection({
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
  const mutation = useSaveAnnotation(result.result_id);

  function handleBoxesChange(next: BoundingBox[]) {
    setBoxes(next);
    onBoxesChange?.(next);
  }

  async function handleSave() {
    await mutation.mutateAsync({
      notes: myAnnotation?.annotation_notes ?? '',
      boxes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isDirty = JSON.stringify(boxes) !== JSON.stringify(initialBoxes);
  // AI-seeded boxes haven't been touched yet still need an explicit save to
  // become this reviewer's own annotation — isDirty alone would never be
  // true if the reviewer agrees with the AI's boxes as-is.
  const canSave = isDirty || (isAiSeeded && boxes.length > 0);
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
            <Button size="sm" onClick={handleSave} loading={mutation.isPending}>
              <Save className="h-3.5 w-3.5" />
              {saved ? 'Saved!' : isAiSeeded ? 'Confirm boxes' : 'Save boxes'}
            </Button>
          )}
        </div>
      </div>

      {/* Canvas area — fills remaining height */}
      <div className="flex-1 min-h-0 bg-slate-900 relative">
        {result.image_url ? (
          <AnnotationCanvas
            imageUrl={result.image_url}
            boxes={boxes}
            onChange={handleBoxesChange}
            otherReviewerBoxes={otherReviewerBoxes}
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
      <div className="px-5 py-2 border-t border-slate-100 bg-slate-50 shrink-0">
        <p className="text-[10px] text-slate-400 font-medium">
          Click and drag on the image to draw bounding boxes. Click a box to remove it.
        </p>
      </div>
    </div>
  );
}
