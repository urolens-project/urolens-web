import { useState } from 'react';
import { Microscope, ImageOff, Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { AnnotationCanvas } from './AnnotationCanvas';
import { useSaveAnnotation } from '../hooks/useResultReview';
import type { BoundingBox, FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

export function MicroscopyImageSection({ result }: Props) {
  const [boxes, setBoxes] = useState<BoundingBox[]>(result.spatial_annotations ?? []);
  const [saved, setSaved] = useState(false);
  const mutation = useSaveAnnotation(result.result_id);

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
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Microscope className="h-4 w-4 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Microscopy Image</h3>
          {boxes.length > 0 && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
              {boxes.length} box{boxes.length !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        {isDirty && (
          <Button size="sm" onClick={handleSave} loading={mutation.isPending}>
            <Save className="h-3.5 w-3.5" />
            {saved ? 'Saved!' : 'Save'}
          </Button>
        )}
      </div>

      {result.image_url ? (
        <AnnotationCanvas
          imageUrl={result.image_url}
          boxes={boxes}
          onChange={setBoxes}
        />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 gap-2">
          <ImageOff className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-400">No microscopy image attached.</p>
        </div>
      )}

      {mutation.isError && (
        <p className="mt-2 text-xs text-red-600">Failed to save annotations.</p>
      )}
    </div>
  );
}