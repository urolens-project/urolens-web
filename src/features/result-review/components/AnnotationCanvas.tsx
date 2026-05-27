import { useRef, useState, useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import type { BoundingBox } from '../types';

const LABELS = [
  'leukocytes',
  'erythrocytes',
  'epithelial_cells',
  'casts',
  'bacteria',
  'crystals',
  'mucus_threads',
] as const;

const LABEL_DISPLAY: Record<string, string> = {
  leukocytes: 'Leukocytes (WBC)',
  erythrocytes: 'Erythrocytes (RBC)',
  epithelial_cells: 'Epithelial Cells',
  casts: 'Casts',
  bacteria: 'Bacteria',
  crystals: 'Crystals',
  mucus_threads: 'Mucus Threads',
};

const LABEL_COLOR: Record<string, string> = {
  leukocytes: '#60a5fa',
  erythrocytes: '#f87171',
  epithelial_cells: '#34d399',
  casts: '#fbbf24',
  bacteria: '#a78bfa',
  crystals: '#22d3ee',
  mucus_threads: '#fb923c',
};

function getColor(label: string) {
  return LABEL_COLOR[label] ?? '#94a3b8';
}

interface Props {
  imageUrl: string;
  boxes: BoundingBox[];
  onChange: (boxes: BoundingBox[]) => void;
  readOnly?: boolean;
  fullHeight?: boolean;
}

interface DrawState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function AnnotationCanvas({ imageUrl, boxes, onChange, readOnly = false, fullHeight = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'view' | 'draw'>('view');
  const [selectedLabel, setSelectedLabel] = useState<string>('leukocytes');
  const [drawing, setDrawing] = useState<DrawState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
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
    setDrawing((d) => d ? { ...d, currentX: px, currentY: py } : null);
  }

  function handleMouseUp() {
    if (!drawing) return;
    const x = Math.min(drawing.startX, drawing.currentX);
    const y = Math.min(drawing.startY, drawing.currentY);
    const w = Math.abs(drawing.currentX - drawing.startX);
    const h = Math.abs(drawing.currentY - drawing.startY);
    if (w > 1 && h > 1) {
      const newBox: BoundingBox = {
        id: crypto.randomUUID(),
        label: selectedLabel,
        x, y, w, h,
      };
      onChange([...boxes, newBox]);
    }
    setDrawing(null);
  }

  function deleteBox(id: string) {
    onChange(boxes.filter((b) => b.id !== id));
    setSelectedId(null);
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

  return (
    <div className={fullHeight ? 'flex flex-col h-full' : 'space-y-2'}>
      {!readOnly && (
        <div className={`flex items-center gap-2 flex-wrap ${fullHeight ? 'px-4 py-3 border-b border-slate-700 shrink-0' : ''}`}>
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
              {LABELS.map((l) => (
                <option key={l} value={l}>{LABEL_DISPLAY[l]}</option>
              ))}
            </select>
          )}

          {boxes.length > 0 && mode === 'view' && (
            <button
              onClick={() => { onChange([]); setSelectedId(null); }}
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
            const color = getColor(box.label);
            const isSelected = selectedId === box.id;
            return (
              <g key={box.id} onClick={(e) => handleBoxClick(e, box.id)} style={{ cursor: 'pointer' }}>
                <rect
                  x={`${box.x}%`}
                  y={`${box.y}%`}
                  width={`${box.w}%`}
                  height={`${box.h}%`}
                  fill={`${color}22`}
                  stroke={color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  strokeDasharray={isSelected ? '4 2' : undefined}
                />
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
                  {LABEL_DISPLAY[box.label] ?? box.label}
                </text>
                {isSelected && !readOnly && (
                  <g
                    onClick={(e) => { e.stopPropagation(); deleteBox(box.id); }}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={`${box.x + box.w}%`}
                      cy={`${box.y}%`}
                      r="8"
                      fill="#ef4444"
                    />
                    <text
                      x={`${box.x + box.w}%`}
                      y={`${box.y}%`}
                      fill="white"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="central"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      ×
                    </text>
                  </g>
                )}
              </g>
            );
          })}

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
      </div>

      {!readOnly && mode === 'view' && boxes.length > 0 && (
        <p className="text-xs text-slate-400">Click a box to select it, then × to delete.</p>
      )}
      {!readOnly && mode === 'draw' && (
        <p className="text-xs text-slate-400">Click and drag on the image to draw a bounding box.</p>
      )}
    </div>
  );
}
