import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResultStatusChip } from './ResultStatusChip';
import { CellCountTable } from './CellCountTable';
import { AIDisclaimer } from '../../../components/feedback/AIDisclaimer';
import type { PatientResultDetail as DetailType } from '../types';

interface PatientResultDetailProps {
  result: DetailType;
  onDownloadPdf?: () => void;
  isDownloading?: boolean;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PatientResultDetail({ result, onDownloadPdf, isDownloading = false }: PatientResultDetailProps) {
  const navigate = useNavigate();
  const isReleased = result.status === 'RELEASED';

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/dashboard/patient/results')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Results
      </button>

      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-800">{result.test_type}</h1>
          <ResultStatusChip status={result.status} />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-6 text-sm text-slate-600">
          {result.confirmed_at && (
            <div>
              <span className="text-slate-400">Date of Analysis:</span>{' '}
              <span className="font-medium">{formatDate(result.confirmed_at)}</span>
            </div>
          )}
          {result.released_at && (
            <div>
              <span className="text-slate-400">Date Released:</span>{' '}
              <span className="font-medium">{formatDate(result.released_at)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Analyzed By */}
      {result.analyzed_by && (
        <div
          className="rounded-xl border border-slate-200 bg-white p-6"
          aria-label="Analyzed by"
        >
          <h2 className="text-base font-bold text-slate-800 mb-3">Analyzed by</h2>
          <p className="text-sm font-semibold text-slate-700">{result.analyzed_by}</p>
          <p className="text-xs text-slate-400 mt-1">Medical Technologist</p>
        </div>
      )}

      {/* Particle Count Table */}
      <div
        className="rounded-xl border border-slate-200 bg-white p-6"
        aria-label="Particle counts"
      >
        <h2 className="text-base font-bold text-slate-800 mb-4">Particle counts</h2>
        <CellCountTable cellCounts={result.particle_counts} />
      </div>

      {/* Laboratory Notes */}
      {result.confirmation_notes && (
        <div
          className="rounded-xl border border-slate-200 bg-white p-6"
          aria-label="Laboratory notes"
        >
          <h2 className="text-base font-bold text-slate-800 mb-3">Laboratory notes</h2>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {result.confirmation_notes}
          </p>
        </div>
      )}

      {/* Analysis Availability Notice */}
      {result.smart_diagnosis_unavailable && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <p className="text-sm text-amber-800" role="status">
            Analysis indicators are currently unavailable for this result.
          </p>
        </div>
      )}

      {/* AI Disclaimer — mandatory */}
      <AIDisclaimer />

      {/* Download PDF — released results only */}
      {isReleased && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <button
            onClick={() => onDownloadPdf?.()}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isDownloading ? 'Preparing PDF...' : 'Download PDF'}
          </button>
        </div>
      )}
    </div>
  );
}
