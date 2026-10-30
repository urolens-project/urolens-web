import type { BoundingBox } from '../../result-review/types';
import type { AddedBoxInput, Detection } from '../types';

// Diffs the canvas's current box list against a field's original AI
// detections to produce the request SaveAnnotationsRequest expects. A
// box whose id still matches an original detection but whose
// particle_type has changed (AnnotationCanvas's own relabel control)
// has no direct "relabel" operation in the contract — represented as
// removing the original detection and adding a new box with the
// corrected label, which is what actually happened from the backend's
// point of view (a human asserted a different particle at that
// position).
export function computeFieldAnnotationEdits(
  boxes: BoundingBox[],
  detections: Detection[],
): { removed_detection_ids: string[]; added_boxes: AddedBoxInput[] } {
  const originalById = new Map(detections.map((d) => [d.id, d]));
  const removedIds: string[] = [];
  const addedBoxes: AddedBoxInput[] = [];

  for (const box of boxes) {
    const original = originalById.get(box.id);
    if (!original) {
      addedBoxes.push({
        particle_type: box.particle_type,
        x: box.x,
        y: box.y,
        w: box.w,
        h: box.h,
      });
    } else if (original.particle_type !== box.particle_type) {
      removedIds.push(box.id);
      addedBoxes.push({
        particle_type: box.particle_type,
        x: box.x,
        y: box.y,
        w: box.w,
        h: box.h,
      });
    }
  }

  for (const detection of detections) {
    const stillPresent = boxes.some((b) => b.id === detection.id);
    if (!stillPresent && !removedIds.includes(detection.id)) {
      removedIds.push(detection.id);
    }
  }

  return { removed_detection_ids: removedIds, added_boxes: addedBoxes };
}
