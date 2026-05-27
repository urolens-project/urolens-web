import { useState } from 'react';
import { StickyNote, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useSaveAnnotation } from '../hooks/useResultReview';

interface Props {
  resultId: string;
  initialNotes: string | null;
}

export function AnnotationInputControl({ resultId, initialNotes }: Props) {
  const [expanded, setExpanded] = useState(!!initialNotes);
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [saved, setSaved] = useState(false);

  const mutation = useSaveAnnotation(resultId);

  async function handleSave() {
    if (!notes.trim()) return;
    await mutation.mutateAsync({ notes: notes.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <button
        className="flex w-full items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100 text-left hover:bg-slate-100/60 transition-colors cursor-pointer"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
            <StickyNote className="h-3.5 w-3.5 text-slate-500" />
          </div>
          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            Supervisor Annotation
          </span>
          {initialNotes && (
            <span className="inline-flex h-2 w-2 rounded-full bg-amber-400" />
          )}
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="p-5 space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add internal annotation or review notes for this result…"
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">{notes.length} chars</span>
            <Button
              size="sm"
              onClick={handleSave}
              loading={mutation.isPending}
              disabled={!notes.trim()}
            >
              {saved ? 'Saved!' : 'Save Note'}
            </Button>
          </div>
          {mutation.isError && (
            <p className="text-xs text-red-600">Failed to save annotation. Please try again.</p>
          )}
        </div>
      )}
    </div>
  );
}
