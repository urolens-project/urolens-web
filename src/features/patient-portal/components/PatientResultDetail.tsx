import { ArrowLeft, Download, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResultStatusChip } from './ResultStatusChip';
import { CellCountTable } from './CellCountTable';
import type { PatientResultDetail as DetailType } from '../types';

interface PatientResultDetailProps {
  result: DetailType;
  onDownloadPdf?: () => void;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PatientResultDetail({ result, onDownloadPdf }: PatientResultDetailProps) {
  const navigate = useNavigate();

  const isReleased = result.status === 'RELEASED';
  const isApproved = result.status === 'APPROVED';
  const showPreliminaryNotice = !isReleased && !isApproved;

  const testDate = formatDate(result.confirmed_at ?? result.created_at);
  const releaseDate = result.released_at ? formatDate(result.released_at) : null;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/dashboard/patient/results')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Results
      </button>

      {/* Section 1: Result Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Result #{result.result_id.slice(0, 8)}
            </h1>
            <p className="mt-0.5 text-xs text-slate-400 font-mono">
              {result.result_id}
            </p>
          </div>
          <ResultStatusChip status={result.status} />
        </div>
        <div className="mt-4 flex items-center gap-6 text-sm text-slate-600">
          <div>
            <span className="text-slate-400">Test Date:</span>{' '}
            <span className="font-medium">{testDate}</span>
          </div>
          {releaseDate && (
            <div>
              <span className="text-slate-400">Released:</span>{' '}
              <span className="font-medium">{releaseDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Cell Count Results */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          Urinalysis Cell Count Findings
        </h2>

        {showPreliminaryNotice && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              This result is currently under review and has not been officially
              released. Results shown are preliminary.
            </span>
          </div>
        )}

        <CellCountTable cellCounts={result.cell_counts} />
      </div>

      {/* Section 3: Interpretation */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          Clinical Interpretation
        </h2>
        {result.interpretation ? (
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {result.interpretation}
          </p>
        ) : (
          <p className="text-sm text-slate-400 italic">
            Interpretation pending. Please check back after the result has been
            reviewed.
          </p>
        )}
      </div>

      {/* Section 4: Signatures */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-800 mb-4">
          Verified By
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-5 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Examined by
            </p>
            <div className="border-b border-slate-300 pb-2 mb-2">
              <span className="text-sm font-semibold text-slate-700">
                {result.medtech_name || 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-400">Medical Technologist</p>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-5 text-center">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
              Reviewed by
            </p>
            <div className="border-b border-slate-300 pb-2 mb-2">
              <span className="text-sm font-semibold text-slate-700">
                {result.pathologist_name || 'Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pathologist
              {result.pathologist_license && (
                <span className="block text-slate-500 font-mono mt-0.5">
                  Lic. No: {result.pathologist_license}
                </span>
              )}
              {!result.pathologist_license && (
                <span className="block text-slate-400 mt-0.5">
                  Lic. No: Pending
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      {isReleased && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <button
            onClick={() => onDownloadPdf?.()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
      )}

      {/* AI Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
        <p className="text-xs text-slate-500 leading-relaxed">
          UroLens is a clinical decision-support tool. AI-generated findings and
          Smart Diagnosis indicators are not substitutes for professional medical
          judgment. All results must be reviewed and confirmed by a licensed
          Medical Technologist and Laboratory Supervisor.
        </p>
      </div>
    </div>
  );
}
