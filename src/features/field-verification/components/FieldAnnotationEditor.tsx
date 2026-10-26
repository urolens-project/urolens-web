// Proposal §10.1 FieldAnnotationEditor, "built from the existing
// AnnotationCanvas": click an AI box to remove or restore it; draw a
// box and pick a class to add a particle.
//
// Deviation from the proposal, noted in the plan: AnnotationCanvas
// renders every box as its own SVG element, which is fine for today's
// detection counts but not the "canvas layer, zoom, pan, per-class
// filter" the proposal calls for to handle up to 1,000 boxes (§10.1).
// That rendering work is deferred — reusing AnnotationCanvas as-is here
// so this stays buildable and correct now, with a clear seam
// (computeFieldAnnotationEdits below) to swap the renderer later
// without touching the diffing/save logic.
import { useMemo, useState } from 'react';
import { Microscope, Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { AnnotationCanvas } from '../../result-review/components/AnnotationCanvas';
import { useSaveFieldAnnotations } from '../hooks/useFieldVerification';
import { computeFieldAnnotationEdits } from '../utils/annotationDiff';
import type { BoundingBox } from '../../result-review/types';
import type { Detection, FieldDetail } from '../types';

interface Props {
  resultId: string;
  field: FieldDetail;
  readOnly: boolean;
}

function detectionsToBoxes(detections: Detection[]): BoundingBox[] {
  return detections.map(({ id, particle_type, x, y, w, h }) => ({ id, particle_type, x, y, w, h }));
}

export function FieldAnnotationEditor({ resultId, field, readOnly }: Props) {
  const initialBoxes = useMemo(() => {
    const aiBoxes = detectionsToBoxes(field.detections);
    const removedIds = new Set(field.annotation_edits.removed_detection_ids);
    const kept = aiBoxes.filter((b) => !removedIds.has(b.id));
    const added = field.annotation_edits.added_boxes.map(
      ({ id, particle_type, x, y, w, h }): BoundingBox => ({ id, particle_type, x, y, w, h }),
    );
    return [...kept, ...added];
    // field.detections/annotation_edits only meaningfully change when a
    // different field is opened (field_id changes) — re-deriving on
    // every field object identity change would also wipe in-progress,
    // unsaved local edits on a background refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.field_id]);

  const [boxes, setBoxes] = useState<BoundingBox[]>(initialBoxes);
  const [error, setError] = useState('');
  const mutation = useSaveFieldAnnotations(resultId, field.field_id);

  const isDirty = JSON.stringify(boxes) !== JSON.stringify(initialBoxes);

  async function handleSave() {
    setError('');
    const edits = computeFieldAnnotationEdits(boxes, field.detections);
    try {
      await mutation.mutateAsync({ ...edits, expected_version: field.version });
    } catch (err) {
      const code = (err as { response?: { data?: { error?: { code?: string } } } }).response?.data
        ?.error?.code;
      setError(
        code === 'FIELD_VERSION_CONFLICT'
          ? 'This field changed elsewhere since you opened it. Reload the field and redo your edits.'
          : 'Failed to save the annotation changes.',
      );
    }
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-120">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
            <Microscope className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Field {field.field_no}
          </h3>
          <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-600">
            {boxes.length} box{boxes.length !== 1 ? 'es' : ''}
          </span>
          {isDirty && (
            <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-600">
              Unsaved
            </span>
          )}
        </div>
        {!readOnly && (
          <Button size="sm" onClick={handleSave} loading={mutation.isPending} disabled={!isDirty}>
            <Save className="h-3.5 w-3.5" />
            Save Boxes
          </Button>
        )}
      </div>

      <div className="flex-1 min-h-0 bg-slate-900 relative">
        <AnnotationCanvas
          imageUrl={field.image_url ?? ''}
          boxes={boxes}
          onChange={setBoxes}
          readOnly={readOnly}
          fullHeight
        />
      </div>

      {error && (
        <div className="px-5 py-2 border-t border-red-100 bg-red-50 shrink-0">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}
      {!readOnly && !error && (
        <div className="px-5 py-2 border-t border-slate-100 bg-slate-50 shrink-0">
          <p className="text-[10px] text-slate-400 font-medium">
            Click and drag to draw a box. Click a box to remove or relabel it.
          </p>
        </div>
      )}
    </div>
  );
}
