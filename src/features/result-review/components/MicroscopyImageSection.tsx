import { useState } from 'react';
import { Microscope, ImageOff, Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { AnnotationCanvas } from './AnnotationCanvas';
import { useSaveAnnotation } from '../hooks/useResultReview';
import type { BoundingBox, FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
  onBoxesChange?: (boxes: BoundingBox[]) => void;
}

export function MicroscopyImageSection({ result, onBoxesChange }: Props) {
  const [boxes, setBoxes] = useState<BoundingBox[]>(result.spatial_annotations ?? []);
  const [saved, setSaved] = useState(false);
  const mutation = useSaveAnnotation(result.result_id);

  function handleBoxesChange(next: BoundingBox[]) {
    setBoxes(next);
    onBoxesChange?.(next);
  }

  async function handleSave() {
    await mutation.mutateAsync({
      notes: result.annotation_notes ?? '',
      boxes,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const isDirty = JSON.stringify(boxes) !== JSON.stringify(result.spatial_annotations ?? []);

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden min-h-160">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
            <Microscope className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">Microscopy Image</h3>
          {boxes.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-600">
              {boxes.length} box{boxes.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mutation.isError && (
            <span className="text-xs text-red-600">Save failed.</span>
          )}
          {isDirty && (
            <Button size="sm" onClick={handleSave} loading={mutation.isPending}>
              <Save className="h-3.5 w-3.5" />
              {saved ? 'Saved!' : 'Save boxes'}
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
