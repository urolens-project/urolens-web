import { Microscope, ImageOff } from 'lucide-react';
import type { FullResultDetail } from '../types';

interface Props {
  result: FullResultDetail;
}

export function MicroscopyImageSection({ result }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Microscope className="h-4 w-4 text-slate-400" />
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Microscopy Image</h3>
      </div>

      {result.image_url ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <img
            src={result.image_url}
            alt="Microscopy specimen"
            className="w-full object-contain max-h-80 bg-slate-900"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-10 gap-2">
          <ImageOff className="h-8 w-8 text-slate-300" />
          <p className="text-sm text-slate-400">No microscopy image attached.</p>
        </div>
      )}
    </div>
  );
}
