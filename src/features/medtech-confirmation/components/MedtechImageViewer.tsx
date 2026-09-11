import { ImageOff, Microscope } from 'lucide-react';
import type { FullResultDetail } from '../../result-review/types';

interface Props {
  result: FullResultDetail;
}

/** Read-only microscopy image view for the MedTech's pre-confirmation
 * screen — deliberately not the Supervisor's MicroscopyImageSection, which
 * draws/saves annotations via a Supervisor-only endpoint. */
export function MedtechImageViewer({ result }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100">
          <Microscope className="h-3.5 w-3.5 text-slate-600" />
        </div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Microscopy Image</h3>
      </div>
      <div className="bg-slate-900 min-h-64 flex items-center justify-center">
        {result.image_url ? (
          <img src={result.image_url} alt="Microscopy specimen" className="max-h-[32rem] w-full object-contain" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-16 text-slate-500">
            <ImageOff className="h-8 w-8" />
            <p className="text-xs">No image available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
