import { useRef, useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { PARTICLE_LABELS, PARTICLE_LABEL_DISPLAY } from '../constants';
import type { BoundingBox } from '../types';

function generateBoxId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `box-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

const LABEL_COLOR: Record<string, string> = {
  leukocytes: '#60a5fa',
  erythrocytes: '#f87171',
  epithelial_cells: '#34d399',
  urinary_casts: '#fbbf24',
  bacteria: '#a78bfa',
  crystals: '#22d3ee',
  mucus_threads: '#fb923c',
  yeast: '#eab308',
  sperm_cells: '#ec4899',
  trichomonas_vaginalis: '#8b5cf6',
};

function getColor(label: string) {
  return LABEL_COLOR[label] ?? '#94a3b8';
}

interface OtherReviewerBoxes {
  ownerLabel: string;
  boxes: BoundingBox[];
}

interface Props {
  imageUrl: string;
  boxes: BoundingBox[];
  onChange: (boxes: BoundingBox[]) => void;
  readOnly?: boolean;
  fullHeight?: boolean;
  // Another reviewer's boxes on the same result — shown dimmed/dashed,
  // never selectable or deletable, so each reviewer can only edit their
  // own set while still seeing where the other one looked.
  otherReviewerBoxes?: OtherReviewerBoxes[];
}

interface DrawState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function AnnotationCanvas({
  imageUrl,
  boxes,
  onChange,
  readOnly = false,
  fullHeight = false,
  otherReviewerBoxes = [],
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'view' | 'draw'>('view');
  const [selectedLabel, setSelectedLabel] = useState<string>('leukocytes');
  const [drawing, setDrawing] = useState<DrawState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // A box only gets its full text label + a brighter outline while hovered
  // or selected — with a dense AI-seeded set (hundreds of boxes on one
  // image is common), permanently labeling every box makes the image
  // unreadable without making any single box easier to find.
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredOtherKey, setHoveredOtherKey] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  const toPercent = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { px: 0, py: 0 };
    return {
      px: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)),
      py: Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100)),
    };
  }, []);

  function handleMouseDown(e: React.MouseEvent) {
    if (mode !== 'draw') return;
    e.preventDefault();
    const { px, py } = toPercent(e.clientX, e.clientY);
    setDrawing({ startX: px, startY: py, currentX: px, currentY: py });
    setSelectedId(null);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!drawing) return;
    const { px, py } = toPercent(e.clientX, e.clientY);
    setDrawing((d) => (d ? { ...d, currentX: px, currentY: py } : null));
  }

  function handleMouseUp() {
    if (!drawing) return;
    const x = Math.min(drawing.startX, drawing.currentX);
    const y = Math.min(drawing.startY, drawing.currentY);
    const w = Math.abs(drawing.currentX - drawing.startX);
    const h = Math.abs(drawing.currentY - drawing.startY);
    if (w > 1 && h > 1) {
      const newBox: BoundingBox = {
        id: generateBoxId(),
        particle_type: selectedLabel,
        x,
        y,
        w,
        h,
      };
      onChange([...boxes, newBox]);
    }
    setDrawing(null);
  }

  function requestDelete(id: string) {
    setPendingDeleteId(id);
  }

  function confirmDelete() {
    if (!pendingDeleteId) return;
    onChange(boxes.filter((b) => b.id !== pendingDeleteId));
    setSelectedId(null);
    setPendingDeleteId(null);
  }

  function relabelBox(id: string, particleType: string) {
    onChange(boxes.map((b) => (b.id === id ? { ...b, particle_type: particleType } : b)));
  }

  function handleBoxClick(e: React.MouseEvent, id: string) {
    if (mode === 'view') {
      e.stopPropagation();
      setSelectedId((prev) => (prev === id ? null : id));
    }
  }

  const previewBox = drawing
    ? {
        x: Math.min(drawing.startX, drawing.currentX),
        y: Math.min(drawing.startY, drawing.currentY),
        w: Math.abs(drawing.currentX - drawing.startX),
        h: Math.abs(drawing.currentY - drawing.startY),
      }
    : null;

  const selectedBox = selectedId ? boxes.find((b) => b.id === selectedId) : undefined;

  return (
    <div className={fullHeight ? 'flex flex-col h-full' : 'space-y-2'}>
      {!readOnly && (
        <div
          className={`flex items-center gap-2 flex-wrap ${fullHeight ? 'px-4 py-3 border-b border-slate-700 shrink-0' : ''}`}
        >
          <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setMode('view')}
              className={`px-3 py-1.5 transition-colors ${mode === 'view' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              View
            </button>
            <button
              onClick={() => setMode('draw')}
              className={`px-3 py-1.5 transition-colors ${mode === 'draw' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
            >
              ✏ Draw Box
            </button>
          </div>

          {mode === 'draw' && (
            <select
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {PARTICLE_LABELS.map((l) => (
                <option key={l} value={l}>
                  {PARTICLE_LABEL_DISPLAY[l]}
                </option>
              ))}
            </select>
          )}

          {boxes.length > 0 && mode === 'view' && (
            <button
              onClick={() => {
                onChange([]);
                setSelectedId(null);
              }}
              className="ml-auto flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-100 transition-colors"
            >
              <Trash2 className="h-3 w-3" />
              Clear all
            </button>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        className={`relative overflow-hidden select-none bg-slate-900 ${fullHeight ? 'flex-1 min-h-0' : 'rounded-xl border border-slate-200'}`}
        style={{ cursor: mode === 'draw' ? 'crosshair' : 'default' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {imgError ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-500">
            <span className="text-xs">Image unavailable</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt="Microscopy specimen"
            className={`w-full pointer-events-none ${fullHeight ? 'h-full object-contain' : 'object-contain max-h-80'}`}
            onError={() => setImgError(true)}
            draggable={false}
          />
        )}

        <svg
          className="absolute inset-0 w-full h-full"
          style={{ pointerEvents: mode === 'view' ? 'auto' : 'none' }}
        >
          {boxes.map((box) => {
            const color = getColor(box.particle_type);
            const isSelected = selectedId === box.id;
            const isHighlighted = isSelected || hoveredId === box.id;
            return (
              <g
                key={box.id}
                onClick={(e) => handleBoxClick(e, box.id)}
                onMouseEnter={() => setHoveredId(box.id)}
                onMouseLeave={() => setHoveredId((prev) => (prev === box.id ? null : prev))}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  x={`${box.x}%`}
                  y={`${box.y}%`}
                  width={`${box.w}%`}
                  height={`${box.h}%`}
                  fill={`${color}${isHighlighted ? '33' : '14'}`}
                  stroke={color}
                  strokeWidth={isSelected ? 2.5 : isHighlighted ? 2 : 1}
                  strokeOpacity={isHighlighted ? 1 : 0.55}
                  strokeDasharray={isSelected ? '4 2' : undefined}
                />
                {isHighlighted && (
                  <>
                    <rect
                      x={`${box.x}%`}
                      y={`${box.y - 5}%`}
                      width={`${Math.min(box.w, 40)}%`}
                      height="5%"
                      fill={color}
                      rx="2"
                    />
                    <text
                      x={`${box.x + 1}%`}
                      y={`${box.y - 1}%`}
                      fill="white"
                      fontSize="9"
                      fontWeight="600"
                      dominantBaseline="auto"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {PARTICLE_LABEL_DISPLAY[box.particle_type] ?? box.particle_type}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {otherReviewerBoxes.map(({ ownerLabel, boxes: theirBoxes }) =>
            theirBoxes.map((box) => {
              const key = `${ownerLabel}-${box.id}`;
              const isHighlighted = hoveredOtherKey === key;
              return (
                <g
                  key={key}
                  onMouseEnter={() => setHoveredOtherKey(key)}
                  onMouseLeave={() => setHoveredOtherKey((prev) => (prev === key ? null : prev))}
                  style={{ pointerEvents: 'auto', cursor: 'default' }}
                >
                  <rect
                    x={`${box.x}%`}
                    y={`${box.y}%`}
                    width={`${box.w}%`}
                    height={`${box.h}%`}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth={isHighlighted ? 2 : 1.5}
                    strokeDasharray="3 3"
                    opacity={isHighlighted ? 1 : 0.5}
                  />
                  {isHighlighted && (
                    <text
                      x={`${box.x + 1}%`}
                      y={`${box.y - 1}%`}
                      fill="#cbd5e1"
                      fontSize="8"
                      fontWeight="600"
                      dominantBaseline="auto"
                      style={{ userSelect: 'none' }}
                    >
                      {ownerLabel}: {PARTICLE_LABEL_DISPLAY[box.particle_type] ?? box.particle_type}
                    </text>
                  )}
                </g>
              );
            }),
          )}

          {previewBox && (
            <rect
              x={`${previewBox.x}%`}
              y={`${previewBox.y}%`}
              width={`${previewBox.w}%`}
              height={`${previewBox.h}%`}
              fill={`${getColor(selectedLabel)}33`}
              stroke={getColor(selectedLabel)}
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
          )}
        </svg>

        {/* Relabel + delete toolbar for the selected box — an HTML overlay
            (not SVG) so it can host a real <select>, positioned with the
            same percentage coordinates the SVG boxes use. */}
        {selectedBox && !readOnly && mode === 'view' && (
          <div
            className="absolute z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
            style={{
              left: `${selectedBox.x}%`,
              top: `${selectedBox.y}%`,
              transform: 'translateY(-100%)',
            }}
          >
            <select
              value={selectedBox.particle_type}
              onChange={(e) => relabelBox(selectedBox.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300"
            >
              {PARTICLE_LABELS.map((l) => (
                <option key={l} value={l}>
                  {PARTICLE_LABEL_DISPLAY[l]}
                </option>
              ))}
            </select>
            <button
              onClick={(e) => {
                e.stopPropagation();
                requestDelete(selectedBox.id);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors"
              title="Delete this box"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {!readOnly && mode === 'view' && boxes.length > 0 && (
        <p className="text-xs text-slate-400">Click a box to relabel or delete it.</p>
      )}
      {!readOnly && mode === 'draw' && (
        <p className="text-xs text-slate-400">
          Click and drag on the image to draw a bounding box.
        </p>
      )}

      <Modal
        open={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        title="Delete this box?"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            This removes the bounding box from your annotation. This can't be undone once saved.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPendingDeleteId(null)}
              className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 h-10 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition cursor-pointer"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
