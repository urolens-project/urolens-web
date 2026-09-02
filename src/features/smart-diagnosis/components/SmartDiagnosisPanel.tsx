import { Brain, AlertTriangle } from 'lucide-react';
import { AIDisclaimer } from '../../../components/feedback/AIDisclaimer';
import { buildConditions } from '../types';
import type { SmartDiagnosisAttached } from '../types';
import { ConditionCard } from './ConditionCard';

interface Props {
  data: SmartDiagnosisAttached | null;
  unavailable?: boolean;
  generatedAt?: string;
}

export function SmartDiagnosisPanel({ data, unavailable = false, generatedAt }: Props) {
  if (unavailable || !data) {
    return <UnavailableNotice />;
  }

  if (data.no_significant_indicators) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
        <PanelHeader engineVersion={data.engine_version} generatedAt={generatedAt} />
        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
          <p className="text-sm font-semibold text-slate-500">No significant diagnostic indicators detected for this sample.</p>
        </div>
        <AIDisclaimer />
      </div>
    );
  }

  const conditions = buildConditions(data);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <PanelHeader engineVersion={data.engine_version} generatedAt={generatedAt} />
      <div className="space-y-3">
        {conditions.map((condition) => (
          <ConditionCard key={condition.label} condition={condition} />
        ))}
      </div>
      <AIDisclaimer />
    </div>
  );
}

function PanelHeader({ engineVersion, generatedAt }: { engineVersion: string; generatedAt?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <Brain className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-black text-slate-900">Smart Diagnosis Result</h3>
      </div>
      <span className="text-[10px] font-mono text-slate-400">
        v{engineVersion}
        {generatedAt ? ` · ${new Date(generatedAt).toLocaleDateString()}` : ''}
      </span>
    </div>
  );
}

function UnavailableNotice() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-2">
      <div className="flex items-center gap-2 text-amber-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <p className="text-sm font-bold">Smart Diagnosis is unavailable for this sample.</p>
      </div>
      <p className="text-xs text-amber-600 leading-relaxed">
        The AI engine could not generate a diagnosis output for this result. You may still review
        the raw findings and approve or return the result manually.
      </p>
    </div>
  );
}
