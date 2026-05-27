import { useParams, useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { PatientResultList } from './components/PatientResultList';
import { PatientResultDetail } from './components/PatientResultDetail';
import { usePatientResults } from './hooks/usePatientResults';
import { useResultDetail, useDownloadResultPdf } from './hooks/useResultDetail';
import { Spinner } from '../../components/ui/Spinner';

export default function PatientPortalPage() {
  const { data: results, isLoading, isError } = usePatientResults();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
        <p className="text-sm text-red-700 font-medium">Failed to load results. Please try again.</p>
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
  const navigate = useNavigate();
  const { data: result, isLoading, isError } = useResultDetail(resultId ?? '');
  const { mutate: downloadPdf } = useDownloadResultPdf();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (isError || !result) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center">
        <FileText className="mx-auto h-10 w-10 text-red-300 mb-3" />
        <p className="text-sm text-red-700 font-medium">Result not found.</p>
        <button
          onClick={() => navigate('/dashboard/patient/results')}
          className="mt-3 text-sm font-medium text-red-600 hover:text-red-800 underline cursor-pointer"
        >
          Back to My Results
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Result Details</h1>
      </div>
      <PatientResultDetail
        result={result}
        onDownloadPdf={() => downloadPdf(result.result_id)}
      />
    </div>
  );
}
