import { Loader2 } from 'lucide-react';
import { useSmartDiagnosis } from '../hooks/useSmartDiagnosis';
import { isDiagnosisUnavailable } from '../types';
import { SmartDiagnosisPanel } from './SmartDiagnosisPanel';

interface Props {
  resultId: string;
}

export function SmartDiagnosisResultPanel({ resultId }: Props) {
  const { data, isLoading, isError } = useSmartDiagnosis(resultId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-8 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs font-medium">Loading Smart Diagnosis...</span>
      </div>
    );
  }

  if (isError || !data || isDiagnosisUnavailable(data)) {
    return <SmartDiagnosisPanel data={null} unavailable />;
  }

  return <SmartDiagnosisPanel data={data} generatedAt={data.generated_at} />;
}
