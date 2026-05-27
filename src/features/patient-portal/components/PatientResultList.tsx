import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight } from 'lucide-react';
import { ResultStatusChip } from './ResultStatusChip';
import type { PatientResultItem } from '../types';

interface PatientResultListProps {
  results: PatientResultItem[];
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Not yet released';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
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

        if (isReleased) {
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
              className="w-full text-left flex items-center justify-between rounded-xl border p-4 transition-colors cursor-pointer hover:border-emerald-300 bg-emerald-50/50 border-emerald-200"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {result.test_type}
                    </span>
                    <ResultStatusChip status={result.status} />
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Released: {formatDate(result.released_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700">
                View Details
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          );
        }

        return (
          <div
            key={result.result_id}
            className="w-full text-left flex items-center rounded-xl border p-4 bg-white border-slate-200 opacity-70"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    {result.test_type}
                  </span>
                  <ResultStatusChip status={result.status} />
                </div>
                <div className="mt-1 text-xs text-slate-500">Not yet released</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
