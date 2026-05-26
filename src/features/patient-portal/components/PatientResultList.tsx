import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import { ResultStatusChip } from './ResultStatusChip';
import type { PatientResultSummary } from '../types';

interface PatientResultListProps {
  results: PatientResultSummary[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not yet released';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

export function PatientResultList({ results }: PatientResultListProps) {
  const navigate = useNavigate();

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-6 py-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-slate-300 mb-3" />
        <p className="text-sm text-slate-500">You have no lab results yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => {
        const isReleased = result.status === 'RELEASED';

        return (
          <div
            key={result.result_id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/dashboard/patient/results/${result.result_id}`)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate(`/dashboard/patient/results/${result.result_id}`);
              }
            }}
            className={`w-full text-left flex items-center justify-between rounded-xl border p-4 transition-colors cursor-pointer hover:border-emerald-300 ${
              isReleased
                ? 'bg-emerald-50/50 border-emerald-200'
                : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isReleased ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {result.result_id.slice(0, 8)}
                  </span>
                  <ResultStatusChip status={result.status} />
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span>Created: {formatDate(result.created_at)}</span>
                  <span className="text-slate-300">|</span>
                  <span>
                    {result.status === 'RELEASED'
                      ? `Released: ${formatDate(result.released_at)}`
                      : 'Not yet released'}
                  </span>
                </div>
              </div>
            </div>
            <div
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  navigate(`/dashboard/patient/results/${result.result_id}`);
                }
              }}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/dashboard/patient/results/${result.result_id}`);
              }}
              className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700 cursor-pointer"
            >
              View Details
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
