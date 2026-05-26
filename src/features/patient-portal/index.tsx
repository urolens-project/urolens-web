import { useParams, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { usePatientResults } from './hooks/usePatientResults';
import { useResultDetail } from './hooks/useResultDetail';
import { PatientResultList } from './components/PatientResultList';
import { PatientResultDetail } from './components/PatientResultDetail';

export default function PatientPortalPage() {
  const { data: results, isLoading, isError } = usePatientResults();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
        <p className="text-sm text-red-700 font-medium">
          Failed to load results. Please try again.
        </p>
        <button
          onClick={() => navigate('/dashboard/patient')}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline cursor-pointer"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">My Results</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and download your laboratory test results.
        </p>
      </div>
      <PatientResultList results={results ?? []} />
    </div>
  );
}

export function PatientResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const {
    data: result,
    isLoading,
    isError,
    error,
  } = useResultDetail(resultId ?? '');
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    const notFound =
      (error as { response?: { data?: { error?: { code?: string } } } })
        ?.response?.data?.error?.code === 'RESULT_NOT_FOUND';

    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
        <FileText className="mx-auto h-10 w-10 text-red-300 mb-3" />
        <p className="text-sm text-red-700 font-medium">
          {notFound
            ? 'Result not found.'
            : 'Result not found or access denied.'}
        </p>
        <button
          onClick={() => navigate('/dashboard/patient/results')}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline cursor-pointer"
        >
          Back to My Results
        </button>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Result Details</h1>
      </div>
      <PatientResultDetail result={result} />
    </div>
  );
}
